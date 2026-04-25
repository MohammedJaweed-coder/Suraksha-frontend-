import { Router } from 'express';
import { IncidentsController } from '../controllers/incidents.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';
import { uploadMultiple, handleUploadError, validateUploadedFiles, mockS3Upload } from '../middleware/upload.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const incidentsController = new IncidentsController();

// POST /api/v1/incidents - Create new incident
router.post('/',
  optionalAuth,
  uploadMultiple('media', 5), // Allow up to 5 media files
  handleUploadError,
  validateUploadedFiles,
  mockS3Upload,
  asyncHandler(incidentsController.createIncident)
);

// GET /api/v1/incidents - Get user's incidents
router.get('/',
  authenticateToken,
  asyncHandler(incidentsController.getUserIncidents)
);

// GET /api/v1/incidents/nearby - Get nearby incidents
router.get('/nearby',
  optionalAuth,
  asyncHandler(incidentsController.getNearbyIncidents)
);

// GET /api/v1/incidents/:id - Get incident by ID
router.get('/:id',
  optionalAuth,
  asyncHandler(incidentsController.getIncidentById)
);

// PATCH /api/v1/incidents/:id/status - Update incident status
router.patch('/:id/status',
  authenticateToken,
  asyncHandler(incidentsController.updateIncidentStatus)
);

export default router;