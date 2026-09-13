import { Request, Response } from 'express';
import { ReportModel, PotholeReportDoc } from '../../database/models/reportModel';
import { ContractorModel } from '../../database/models/contractorModel';
import { sendAuthorityAlertEmail } from '../services/emailService';

export const ReportController = {
  async getAllReports(req: Request, res: Response) {
    try {
      const citizenId = typeof req.query.citizenId === 'string' ? req.query.citizenId.trim() : '';
      const reports = citizenId
        ? await ReportModel.getByCitizenId(citizenId)
        : await ReportModel.getAll();

      return res.json({ success: true, count: reports.length, data: reports });
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  async getReportById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await ReportModel.getById(id);
      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }
      return res.json({ success: true, data: report });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  async createReport(req: Request, res: Response) {
    try {
      const body = req.body;

      const reportId = `RG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const timestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const newReport: PotholeReportDoc = {
        id: reportId,
        title: body.title || `Pothole detected on ${body.location?.roadName || 'Road Corridor'}`,
        description: body.description || 'Road surface deformation flagged by AI vision scanner.',
        imageUrl:
          body.imageUrl ||
          'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        severity: body.severity || 'severe',
        priority: body.severity === 'severe' ? 'critical' : body.severity === 'moderate' ? 'urgent' : 'normal',
        status: 'reported',
        confidenceScore: body.confidenceScore || 94,
        location: body.location || {
          address: 'Highway Milepost 14',
          roadName: 'Main Highway Stretch',
          city: 'New Delhi',
          state: 'Delhi',
          lat: 28.6139,
          lng: 77.209,
        },
        reportedBy: body.reportedBy || {
          name: 'Citizen Portal User',
          phone: '+91 98765 43210',
          citizenId: `CIT-${Math.floor(1000 + Math.random() * 9000)}`,
        },
        reportedAt: timestamp,
        aiAnalysis: body.aiAnalysis || {
          detected: true,
          detectedCount: 1,
          confidenceScore: body.confidenceScore || 94,
          severity: body.severity || 'severe',
          boundingBoxes: [{ x: 30, y: 35, width: 40, height: 35 }],
          estimatedDimensions: { widthCm: 65, depthCm: 12.4, areaSqM: 0.45 },
          roadCondition: 'Cavitation and asphalt binder breakdown detected by vision engine',
          recommendedUrgency: 'Road authority dispatch recommended within 24 hours',
        },
        timeline: [
          {
            status: 'reported',
            timestamp,
            title: 'Pothole Reported',
            description: 'Captured via RoadGuard AI scanner and logged in MongoDB database.',
            actor: 'Citizen / AI Vision System',
          },
        ],
        emailAlertSent: true,
      };

      // 1. Save to MongoDB
      const createdReport = await ReportModel.create(newReport);

      // 2. Start authority email delivery without blocking report submission.
      // SMTP can be slow or temporarily unreachable; the citizen report must still
      // complete immediately after MongoDB has saved it.
      void sendAuthorityAlertEmail({
        report: createdReport,
        recipientEmail: req.body.customAuthorityEmail,
      })
        .then((emailNotification) => {
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
        message: 'Pothole report registered in MongoDB. Authority email dispatch started.',
        data: createdReport,
        emailAlert: null,
      });
    } catch (error: any) {
      console.error('Error creating report:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateReportStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, note, actor } = req.body;

      const updated = await ReportModel.updateStatus(id, status, note, actor);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }
      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  async assignContractor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { contractorId, contractorName, priority, deadline } = req.body;

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

      // Increment contractor active projects count in MongoDB
      if (contractorId) {
        await ContractorModel.incrementActiveProjects(contractorId);
      }

      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};
