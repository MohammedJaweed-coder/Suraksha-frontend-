import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | ApiError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  // Log error for debugging
  console.error('❌ Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    
    // Include validation details in development
    if (process.env['NODE_ENV'] === 'development') {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        received: 'received' in err ? err.received : undefined,
      }));
      
      res.status(statusCode).json({
        error: message,
        message: 'Request validation failed',
        code,
        timestamp: new Date().toISOString(),
        validationErrors,
      });
      return;
    }
  } else if ('statusCode' in error && typeof error.statusCode === 'number') {
    statusCode = error.statusCode;
    message = error.message;
    code = 'code' in error && typeof error.code === 'string' ? error.code : 'API_ERROR';
  }

  // Handle specific HTTP errors
  if (error.message.includes('ENOTFOUND')) {
    statusCode = 503;
    message = 'Service unavailable';
    code = 'SERVICE_UNAVAILABLE';
  } else if (error.message.includes('ECONNREFUSED')) {
    statusCode = 503;
    message = 'Connection refused';
    code = 'CONNECTION_REFUSED';
  } else if (error.message.includes('timeout')) {
    statusCode = 408;
    message = 'Request timeout';
    code = 'REQUEST_TIMEOUT';
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    message: statusCode >= 500 ? 'Internal server error' : message,
    code,
    timestamp: new Date().toISOString(),
    ...(process.env['NODE_ENV'] === 'development' && {
      stack: error.stack,
      details: error.message,
    }),
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};