import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /health',
      'POST /api/v1/auth/generate-registration-options',
      'POST /api/v1/auth/verify-registration',
      'POST /api/v1/auth/generate-authentication-options',
      'POST /api/v1/auth/verify-authentication',
      'POST /api/v1/incidents/sos',
      'POST /api/v1/incidents/violation',
      'GET /api/v1/incidents/:id',
      'GET /api/v1/map/heatmap',
      'POST /api/v1/sync',
    ],
  });
};