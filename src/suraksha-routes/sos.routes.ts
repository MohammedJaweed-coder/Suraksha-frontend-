import { Router } from 'express';
import { SOSController } from '../controllers/sos.controller';

const router = Router();
const sosController = new SOSController();

// POST /api/sos - Trigger SOS alert
router.post('/', sosController.triggerSOS);

// GET /api/sos/active - Get active SOS alerts (for admin)
router.get('/active', sosController.getActiveSOSAlerts);

// POST /api/sos/:id/resolve - Resolve SOS alert (admin only)
router.post('/:id/resolve', sosController.resolveSOSAlert);

export default router;