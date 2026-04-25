import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { optionalAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const syncController = new SyncController();

// POST /api/v1/sync
router.post('/',
  optionalAuth, // Can sync without auth for anonymous reports
  asyncHandler(syncController.syncOfflinePayloads)
);

// GET /api/v1/sync/status
router.get('/status',
  optionalAuth,
  asyncHandler(syncController.getSyncStatus)
);

export default router;