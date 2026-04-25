import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';

const router = Router();
const reportController = new ReportController();

// POST /api/report - Submit a new report with image/video
router.post('/', reportController.submitReport);

// GET /api/my-reports - Get all reports for the current user
router.get('/my-reports', reportController.getMyReports);

// GET /api/reports/:id - Get specific report by ID
router.get('/:id', reportController.getReportById);

// PATCH /api/report/:id/resolve - Mark report as resolved (Admin only)
router.patch('/:id/resolve', reportController.resolveReport);

export default router;