import { Request } from 'express';
import { MockDb } from '../data/mockDb';
import { MediaType } from '../data/mockData';
import { AppError } from '../middleware/error.middleware';

export class MediaService {
  /**
   * Upload media file to mock S3 storage
   */
  async uploadMedia(
    file: Express.Multer.File,
    incidentId: string,
    userId?: string
  ): Promise<{
    mediaId: string;
    url: string;
    fileHash: string;
    s3Key: string;
  }> {
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate mock S3 key and URL
      const timestamp = Date.now();
      const fileExtension = file.originalname?.split('.').pop() || 'jpg';
      const s3Key = `incidents/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${timestamp}.${fileExtension}`;
      const mockUrl = `https://mock.suraksha.ai/media/${s3Key}`;

      // Generate fake SHA-256 hash
      const fileHash = this.generateFakeHash();

      // Determine media type
      const mediaType = this.getMediaTypeFromMimeType(file.mimetype);

      // Save to mock database
      const media = await MockDb.addMedia({
        fileName: `${timestamp}.${fileExtension}`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        mediaType,
        s3Key,
        s3Bucket: 'suraksha-media-mock',
        s3Region: 'auto',
        fileHash,
        incidentId,
      });

      console.log('📁 MOCK MEDIA UPLOADED:', {
        mediaId: media.id,
        fileName: media.fileName,
        fileSize: file.size,
        mimeType: file.mimetype,
        s3Key,
        incidentId,
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString(),
      });

      return {
        mediaId: media.id,
        url: mockUrl,
        fileHash,
        s3Key,
      };
    } catch (error) {
      throw new AppError('Failed to upload media file', 500, 'MEDIA_UPLOAD_FAILED');
    }
  }

  /**
   * Get presigned URL for media download (mock)
   */
  async getPresignedUrl(s3Key: string): Promise<string> {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Return mock presigned URL
    const mockPresignedUrl = `https://mock.suraksha.ai/media/${s3Key}?expires=${Date.now() + 3600000}`;
    
    console.log('🔗 MOCK PRESIGNED URL GENERATED:', {
      s3Key,
      url: mockPresignedUrl.substring(0, 50) + '...',
      timestamp: new Date().toISOString(),
    });

    return mockPresignedUrl;
  }

  /**
   * Delete media file (mock)
   */
  async deleteMedia(s3Key: string): Promise<void> {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('🗑️ MOCK MEDIA DELETED:', {
      s3Key,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Health check for storage service
   */
  async healthCheck(): Promise<boolean> {
    // Mock storage is always healthy
    await new Promise(resolve => setTimeout(resolve, 50));
    return true;
  }

  /**
   * Process uploaded files from multipart request
   */
  async processUploadedFiles(
    req: Request,
    incidentId: string
  ): Promise<Array<{
    mediaId: string;
    url: string;
    fileHash: string;
    fileName: string;
    mediaType: string;
  }>> {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return [];
    }

    const uploadResults = [];

    for (const file of files) {
      try {
        const result = await this.uploadMedia(file, incidentId, req.userId);
        const mediaType = this.getMediaTypeFromMimeType(file.mimetype);
        
        uploadResults.push({
          mediaId: result.mediaId,
          url: result.url,
          fileHash: result.fileHash,
          fileName: file.originalname || 'unknown',
          mediaType,
        });
      } catch (error) {
        console.error(`Failed to upload file ${file.originalname}:`, error);
        // Continue with other files
      }
    }

    return uploadResults;
  }

  /**
   * Get media type from MIME type
   */
  private getMediaTypeFromMimeType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) {
      return MediaType.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      return MediaType.VIDEO;
    } else if (mimeType.startsWith('audio/')) {
      return MediaType.AUDIO;
    }
    return MediaType.IMAGE; // Default fallback
  }

  /**
   * Generate fake SHA-256 hash
   */
  private generateFakeHash(): string {
    return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  /**
   * Validate file type and size
   */
  validateFile(file: Express.Multer.File): void {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/wav',
      'audio/mp3',
      'audio/webm',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError(
        `File type ${file.mimetype} not allowed`,
        400,
        'INVALID_FILE_TYPE'
      );
    }

    // Check file size limits
    const maxSizes = {
      image: 50 * 1024 * 1024, // 50MB
      video: 100 * 1024 * 1024, // 100MB
      audio: 10 * 1024 * 1024, // 10MB
    };

    let maxSize = maxSizes.image;
    if (file.mimetype.startsWith('video/')) {
      maxSize = maxSizes.video;
    } else if (file.mimetype.startsWith('audio/')) {
      maxSize = maxSizes.audio;
    }

    if (file.size > maxSize) {
      throw new AppError(
        `File size ${file.size} exceeds maximum allowed size ${maxSize}`,
        400,
        'FILE_TOO_LARGE'
      );
    }
  }
}