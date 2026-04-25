import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { AppError } from './error.middleware';

export interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  files?: {
    single?: string; // Field name for single file
    multiple?: string; // Field name for multiple files
    maxCount?: number; // Maximum number of files
  };
}

/**
 * Middleware factory for request validation using Zod schemas
 */
export function validate(options: ValidationOptions) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      if (options.body) {
        req.body = options.body.parse(req.body);
      }

      // Validate query parameters
      if (options.query) {
        // Convert query string values to appropriate types
        const processedQuery = processQueryParams(req.query);
        req.query = options.query.parse(processedQuery);
      }

      // Validate route parameters
      if (options.params) {
        req.params = options.params.parse(req.params);
      }

      // Validate file uploads
      if (options.files) {
        validateFiles(req, options.files);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          received: 'received' in err ? err.received : undefined,
        }));

        next(new AppError(
          `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        ));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Process query parameters to convert string values to appropriate types
 */
function processQueryParams(query: any): any {
  const processed: any = {};

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      // Try to convert to number if it looks like a number
      if (/^-?\d+(\.\d+)?$/.test(value)) {
        processed[key] = parseFloat(value);
      }
      // Try to convert to boolean if it looks like a boolean
      else if (value === 'true' || value === 'false') {
        processed[key] = value === 'true';
      }
      // Keep as string
      else {
        processed[key] = value;
      }
    } else {
      processed[key] = value;
    }
  }

  return processed;
}

/**
 * Validate uploaded files
 */
function validateFiles(req: Request, fileOptions: NonNullable<ValidationOptions['files']>): void {
  if (fileOptions.single) {
    const file = (req as any).file;
    if (!file) {
      throw new AppError(`File '${fileOptions.single}' is required`, 400, 'FILE_REQUIRED');
    }
  }

  if (fileOptions.multiple) {
    const files = (req as any).files;
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new AppError(`Files '${fileOptions.multiple}' are required`, 400, 'FILES_REQUIRED');
    }

    if (fileOptions.maxCount && files.length > fileOptions.maxCount) {
      throw new AppError(
        `Too many files. Maximum ${fileOptions.maxCount} allowed`,
        400,
        'TOO_MANY_FILES'
      );
    }
  }
}

/**
 * Middleware for validating multipart form data with files
 */
export function validateMultipart(schema: ZodSchema, fileField?: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Validate the non-file fields
      const validatedData = schema.parse(req.body);
      req.body = validatedData;

      // Check if required file is present
      if (fileField) {
        const file = (req as any).file;
        if (!file) {
          throw new AppError(`File '${fileField}' is required`, 400, 'FILE_REQUIRED');
        }
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          received: 'received' in err ? err.received : undefined,
        }));

        next(new AppError(
          `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        ));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Sanitize and validate coordinates
 */
export function validateCoordinates(lat: any, lng: any): { latitude: number; longitude: number } {
  const coordinateSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  });

  return coordinateSchema.parse({
    latitude: typeof lat === 'string' ? parseFloat(lat) : lat,
    longitude: typeof lng === 'string' ? parseFloat(lng) : lng,
  });
}

/**
 * Validate UUID format
 */
export function validateUUID(id: string): string {
  const uuidSchema = z.string().uuid();
  return uuidSchema.parse(id);
}

/**
 * Validate and sanitize string input
 */
export function validateString(input: any, minLength: number = 1, maxLength: number = 255): string {
  const stringSchema = z.string().min(minLength).max(maxLength).trim();
  return stringSchema.parse(input);
}

/**
 * Validate integer within range
 */
export function validateInteger(input: any, min?: number, max?: number): number {
  let schema = z.number().int();
  
  if (min !== undefined) {
    schema = schema.min(min);
  }
  
  if (max !== undefined) {
    schema = schema.max(max);
  }

  const value = typeof input === 'string' ? parseInt(input, 10) : input;
  return schema.parse(value);
}

/**
 * Validate float within range
 */
export function validateFloat(input: any, min?: number, max?: number): number {
  let schema = z.number();
  
  if (min !== undefined) {
    schema = schema.min(min);
  }
  
  if (max !== undefined) {
    schema = schema.max(max);
  }

  const value = typeof input === 'string' ? parseFloat(input) : input;
  return schema.parse(value);
}