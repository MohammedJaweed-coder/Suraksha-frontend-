import { Router } from 'express';
import { MapController } from '../controllers/map.controller';
import { optionalAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const mapController = new MapController();

// GET /api/v1/map/heatmap
router.get('/heatmap',
  optionalAuth, // Can access maps without auth
  asyncHandler(mapController.getHeatmap)
);

// GET /api/v1/map/stats
router.get('/stats',
  optionalAuth,
  asyncHandler(mapController.getRegionStats)
);

// GET /api/v1/map/darkspots
router.get('/darkspots',
  optionalAuth,
  asyncHandler(mapController.getDarkSpots)
);

export default router;