import { Request, Response } from 'express';
import { NotificationModel } from '../../database/models/notificationModel';
import { sendAuthorityAlertEmail } from '../services/emailService';
import { ReportModel } from '../../database/models/reportModel';

export const EmailController = {
  async getAllNotifications(req: Request, res: Response) {
    try {
      const logs = await NotificationModel.getAll();
      return res.json({ success: true, count: logs.length, data: logs });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  async testDispatch(req: Request, res: Response) {
    try {
      const reports = await ReportModel.getAll();
      const targetReport = reports[0];
      if (!targetReport) {
        return res.status(404).json({ success: false, error: 'No reports found to send alert for' });
      }

      const email = await sendAuthorityAlertEmail({
        report: targetReport,
        recipientEmail: req.body.email,
      });

      return res.json({
        success: true,
        message: 'Test email notification dispatched to Authority',
        data: email,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};
