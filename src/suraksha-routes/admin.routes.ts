import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const adminController = new AdminController();

// GET /api/admin/overview - Get dashboard overview statistics
router.get('/overview', adminController.getDashboardOverview);

// GET /api/admin/inbox - Get all reports in admin inbox (like messages)
router.get('/inbox', adminController.getInbox);

// POST /api/admin/inbox/:id/acknowledge - Acknowledge a report
router.post('/inbox/:id/acknowledge', adminController.acknowledgeReport);

// GET /api/admin/reports - Get all reports (admin view)
router.get('/reports', adminController.getAllReports);

// GET /api/admin/sos - Get all SOS alerts (admin view)
router.get('/sos', adminController.getAllSOSAlerts);

// GET /api/admin/notifications - Get all notifications (admin view)
router.get('/notifications', adminController.getNotifications);

// POST /api/admin/notifications/:id/read - Mark notification as read
router.post('/notifications/:id/read', adminController.markNotificationAsRead);

export default router;