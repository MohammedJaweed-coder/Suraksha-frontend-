import { Router } from 'express';
import { CCTVController } from '../controllers/cctv.controller';

const router = Router();
const cctvController = new CCTVController();

// GET /api/cctv - Get all CCTV feeds with crowd monitoring data
router.get('/', cctvController.getCCTVFeeds);

// POST /api/cctv/:id/crowd - Update crowd density for a CCTV feed (simulated)
router.post('/:id/crowd', cctvController.updateCrowdDensity);

// GET /api/cctv/high-risk - Get high-risk CCTV feeds
router.get('/high-risk', cctvController.getHighRiskFeeds);

export default router;