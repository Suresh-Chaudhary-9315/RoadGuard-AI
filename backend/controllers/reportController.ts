import { Response } from 'express';
import { ReportModel, PotholeReportDoc } from '../../database/models/reportModel';
import { ContractorModel } from '../../database/models/contractorModel';
import { sendAuthorityAlertEmail } from '../services/emailService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const VALID_SEVERITIES = new Set(['minor', 'moderate', 'severe']);
const VALID_STATUSES = new Set([
  'reported',
  'verified',
  'assigned',
  'in_progress',
  'completed',
  'rejected',
]);

export const ReportController = {
  async getAllReports(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.authUser!;
      const reports =
        user.role === 'citizen'
          ? await ReportModel.getByCitizenId(user.id)
          : await ReportModel.getAll();

      return res.json({ success: true, count: reports.length, data: reports });
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  async getReportById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const report = await ReportModel.getById(id);
      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }

      if (
        req.authUser?.role === 'citizen' &&
        report.reportedBy?.citizenId !== req.authUser.id
      ) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }

      return res.json({ success: true, data: report });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  async createReport(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.authUser!;
      const body = req.body || {};

      if (user.role !== 'citizen') {
        return res.status(403).json({ success: false, error: 'Only citizens can create pothole reports.' });
      }

      if (!body.location || typeof body.location !== 'object') {
        return res.status(400).json({ success: false, error: 'Report location is required.' });
      }
      if (!VALID_SEVERITIES.has(body.severity)) {
        return res.status(400).json({ success: false, error: 'A valid severity is required.' });
      }

      const reportId = `TS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const timestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const confidenceScore = Number.isFinite(Number(body.confidenceScore))
        ? Number(body.confidenceScore)
        : 0;

      const newReport: PotholeReportDoc = {
        id: reportId,
        title:
          String(body.title || '').trim() ||
          `Pothole reported on ${body.location?.roadName || 'Road Corridor'}`,
        description:
          String(body.description || '').trim() || 'Citizen-submitted road damage report.',
        imageUrl: String(body.imageUrl || ''),
        severity: body.severity,
        priority:
          body.severity === 'severe'
            ? 'critical'
            : body.severity === 'moderate'
            ? 'urgent'
            : 'normal',
        status: 'reported',
        confidenceScore,
        location: body.location,
        reportedBy: {
          name: user.name,
          phone: user.phone,
          citizenId: user.id,
        },
        reportedAt: timestamp,
        aiAnalysis: body.aiAnalysis || {
          detected: false,
          detectedCount: 0,
          confidenceScore,
          severity: body.severity,
          boundingBoxes: [],
          estimatedDimensions: { widthCm: 0, depthCm: 0, areaSqM: 0 },
          roadCondition: 'Not estimated by current AI model',
          recommendedUrgency: 'Determined from submitted severity',
        },
        timeline: [
          {
            status: 'reported',
            timestamp,
            title: 'Pothole Reported',
            description: 'Citizen report logged in the RoadGuard database.',
            actor: user.name,
          },
        ],
        emailAlertSent: false,
      };

      const createdReport = await ReportModel.create(newReport);

      // Email runs independently so a temporary email-provider issue can never
      // block or roll back an already-saved citizen report.
      void sendAuthorityAlertEmail({ report: createdReport })
        .then(async (emailNotification) => {
          await ReportModel.setEmailAlertSent(
            createdReport.id,
            emailNotification.status === 'sent' || emailNotification.status === 'delivered'
          );
          console.log(
            `[ReportController] Email dispatch for ${createdReport.id}: ${emailNotification.status}`
          );
        })
        .catch((emailError: any) => {
          console.error(
            `[ReportController] Email dispatch failed for ${createdReport.id}:`,
            emailError?.message || emailError
          );
        });

      return res.status(201).json({
        success: true,
        message: 'Pothole report registered in MongoDB. Authority notification queued.',
        data: createdReport,
        emailAlert: null,
      });
    } catch (error: any) {
      console.error('Error creating report:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateReportStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const status = String(req.body?.status || '');
      const note = req.body?.note ? String(req.body.note) : undefined;

      if (!VALID_STATUSES.has(status)) {
        return res.status(400).json({ success: false, error: 'Invalid report status.' });
      }

      const updated = await ReportModel.updateStatus(
        id,
        status as PotholeReportDoc['status'],
        note,
        req.authUser?.name || 'Authority Desk'
      );
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }
      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  async assignContractor(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { contractorId, contractorName, priority, deadline } = req.body || {};

      if (!contractorId || !contractorName) {
        return res.status(400).json({ success: false, error: 'Contractor selection is required.' });
      }

      const updated = await ReportModel.assignContractor(
        id,
        contractorId,
        contractorName,
        priority || 'urgent',
        deadline || 'Standard 48h'
      );

      if (!updated) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }

      await ContractorModel.incrementActiveProjects(contractorId);
      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};
