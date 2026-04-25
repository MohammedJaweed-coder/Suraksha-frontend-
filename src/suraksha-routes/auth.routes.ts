import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// POST /api/auth/login - One-time login system
router.post('/login', authController.login);

// GET /api/auth/me - Get current user info from token
router.get('/me', authController.getCurrentUser);

export default router;