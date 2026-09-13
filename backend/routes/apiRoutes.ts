import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { ContractorController } from '../controllers/contractorController';
import { EmailController } from '../controllers/emailController';
import { AuthController } from '../controllers/authController';
import { getDatabaseStatus } from '../../database/connection';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public health/system endpoints
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

// Authentication
router.post('/auth/register/citizen', AuthController.registerCitizen);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', requireAuth, AuthController.me);
router.post('/auth/logout', AuthController.logout);

// Admin-only authority account management. There is intentionally no public
// authority signup endpoint.
router.get('/admin/authorities', requireRole('admin'), AuthController.listAuthorities);
router.post('/admin/authorities', requireRole('admin'), AuthController.createAuthority);
router.patch(
  '/admin/authorities/:id/active',
  requireRole('admin'),
  AuthController.setAuthorityActive
);

// Reports: citizens see/create only their own reports. Authorities/admins can
// see all reports, but only authority/admin can change workflow state.
router.get('/reports', requireAuth, ReportController.getAllReports);
router.get('/reports/:id', requireAuth, ReportController.getReportById);
router.post('/reports', requireRole('citizen'), ReportController.createReport);
router.patch(
  '/reports/:id/status',
  requireRole('authority', 'admin'),
  ReportController.updateReportStatus
);
router.post(
  '/reports/:id/assign',
  requireRole('authority', 'admin'),
  ReportController.assignContractor
);

// Contractor management is authority/admin-only.
router.get('/contractors', requireRole('authority', 'admin'), ContractorController.getAllContractors);
router.get(
  '/contractors/:id',
  requireRole('authority', 'admin'),
  ContractorController.getContractorById
);
router.post('/contractors', requireRole('authority', 'admin'), ContractorController.createContractor);

// Authority email notification history/test dispatch is private.
router.get(
  '/notifications/emails',
  requireRole('authority', 'admin'),
  EmailController.getAllNotifications
);
router.post(
  '/notifications/test-email',
  requireRole('authority', 'admin'),
  EmailController.testDispatch
);

export default router;
