import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const authController = new AuthController();

// POST /api/v1/auth/generate-registration-options
router.post('/generate-registration-options', 
  asyncHandler(authController.generateRegistrationOptions)
);

// POST /api/v1/auth/verify-registration
router.post('/verify-registration', 
  asyncHandler(authController.verifyRegistration)
);

// POST /api/v1/auth/generate-authentication-options
router.post('/generate-authentication-options', 
  asyncHandler(authController.generateAuthenticationOptions)
);

// POST /api/v1/auth/verify-authentication
router.post('/verify-authentication', 
  asyncHandler(authController.verifyAuthentication)
);

// GET /api/v1/auth/profile - Get current user profile
router.get('/profile',
  authenticateToken,
  asyncHandler(authController.getProfile)
);

// PATCH /api/v1/auth/profile - Update user profile
router.patch('/profile',
  authenticateToken,
  asyncHandler(authController.updateProfile)
);

export default router;