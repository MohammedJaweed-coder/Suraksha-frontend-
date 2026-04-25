import multer from 'multer';
import { Request } from 'express';
import { AppError } from './error.middleware';

// Configure multer for memory storage (since we're mocking S3)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/webm',
    'audio/ogg',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} not allowed`, 400, 'INVALID_FILE_TYPE'));
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 10, // Maximum 10 files per request
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => {
  return upload.single(fieldName);
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => {
  return upload.array(fieldName, maxCount);
};

// Middleware for mixed file upload (different field names)
export const uploadFields = (fields: { name: string; maxCount?: number }[]) => {
  return upload.fields(fields);
};

// Error handling middleware for multer errors
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return next(new AppError('File too large', 400, 'FILE_TOO_LARGE'));
      case 'LIMIT_FILE_COUNT':
        return next(new AppError('Too many files', 400, 'TOO_MANY_FILES'));
      case 'LIMIT_UNEXPECTED_FILE':
        return next(new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE'));
      default:
        return next(new AppError('File upload error', 400, 'UPLOAD_ERROR'));
    }
  }
  next(error);
};

// Validate uploaded files
export const validateUploadedFiles = (req: Request, res: any, next: any) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    // No files is okay for some endpoints
    return next();
  }

  // Check individual file sizes based on type
  for (const file of files) {
    let maxSize: number;
    
    if (file.mimetype.startsWith('image/')) {
      maxSize = 50 * 1024 * 1024; // 50MB for images
    } else if (file.mimetype.startsWith('video/')) {
      maxSize = 100 * 1024 * 1024; // 100MB for videos
    } else if (file.mimetype.startsWith('audio/')) {
      maxSize = 10 * 1024 * 1024; // 10MB for audio
    } else {
      maxSize = 10 * 1024 * 1024; // 10MB default
    }

    if (file.size > maxSize) {
      return next(new AppError(
        `File ${file.originalname} exceeds maximum size limit`,
        400,
        'FILE_TOO_LARGE'
      ));
    }
  }

  next();
};

// Mock S3 upload middleware (simulates file processing)
export const mockS3Upload = async (req: Request, res: any, next: any) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (files && files.length > 0) {
      // Simulate upload processing time
      await new Promise(resolve => setTimeout(resolve, 200 * files.length));
      
      console.log('📁 MOCK S3 UPLOAD PROCESSED:', {
        fileCount: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        timestamp: new Date().toISOString(),
      });
    }
    
    next();
  } catch (error) {
    next(new AppError('Mock S3 upload failed', 500, 'MOCK_UPLOAD_ERROR'));
  }
};