import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authenticateToken = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Access token required', 401, 'TOKEN_REQUIRED');
    }

    // Handle mock JWT token
    if (token === 'mock-jwt-suraksha-2026') {
      req.userId = 'mock-user-id';
      next();
      return;
    }

    // For real JWT tokens (if any)
    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      throw new AppError('JWT secret not configured', 500, 'JWT_SECRET_MISSING');
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
    }
    throw error;
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    // Handle mock JWT token
    if (token === 'mock-jwt-suraksha-2026') {
      req.userId = 'mock-user-id';
      next();
      return;
    }

    // For real JWT tokens (if any)
    const jwtSecret = process.env['JWT_SECRET'];
    if (jwtSecret) {
      try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        req.userId = decoded.userId;
      } catch {
        // Ignore invalid tokens in optional auth
      }
    }
    
    next();
  } catch (error) {
    // In optional auth, we don't throw errors for invalid tokens
    next();
  }
};