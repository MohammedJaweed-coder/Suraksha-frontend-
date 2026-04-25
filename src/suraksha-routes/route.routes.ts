import { Router } from 'express';
import { RouteController } from '../controllers/route.controller';

const router = Router();
const routeController = new RouteController();

// POST /api/routes - Calculate safe routes between source and destination
router.post('/', routeController.calculateRoutes);

// GET /api/routes/safe-locations - Get list of safe locations (mock data)
router.get('/safe-locations', routeController.getSafeLocations);

export default router;