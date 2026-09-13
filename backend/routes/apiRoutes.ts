import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { ContractorController } from '../controllers/contractorController';
import { EmailController } from '../controllers/emailController';
import { getDatabaseStatus } from '../../database/connection';

const router = Router();

// Health & System Info
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'RoadGuard AI Platform',
  });
});

router.get('/database/status', (req, res) => {
  const status = getDatabaseStatus();
  res.json({ success: true, database: status });
});

// Pothole Reports CRUD & Auto-Email
router.get('/reports', ReportController.getAllReports);
router.get('/reports/:id', ReportController.getReportById);
router.post('/reports', ReportController.createReport);
router.patch('/reports/:id/status', ReportController.updateReportStatus);
router.post('/reports/:id/assign', ReportController.assignContractor);

// Road Contractors
router.get('/contractors', ContractorController.getAllContractors);
router.get('/contractors/:id', ContractorController.getContractorById);
router.post('/contractors', ContractorController.createContractor);

// Email Notifications
router.get('/notifications/emails', EmailController.getAllNotifications);
router.post('/notifications/test-email', EmailController.testDispatch);

export default router;
