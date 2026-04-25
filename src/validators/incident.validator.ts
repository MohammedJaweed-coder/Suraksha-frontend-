import { z } from 'zod';

// =============================================================================
// COORDINATE VALIDATION
// =============================================================================

// Bengaluru bounds (approximate)
const BENGALURU_BOUNDS = {
  LAT_MIN: 12.7,   // South boundary
  LAT_MAX: 13.2,   // North boundary  
  LNG_MIN: 77.3,   // West boundary
  LNG_MAX: 78.0,   // East boundary
};

// Global coordinate bounds
const GLOBAL_BOUNDS = {
  LAT_MIN: -90,
  LAT_MAX: 90,
  LNG_MIN: -180,
  LNG_MAX: 180,
};

export const coordinateSchema = z.object({
  latitude: z
    .number()
    .min(GLOBAL_BOUNDS.LAT_MIN, 'Latitude must be between -90 and 90')
    .max(GLOBAL_BOUNDS.LAT_MAX, 'Latitude must be between -90 and 90')
    .refine(
      (lat) => lat >= BENGALURU_BOUNDS.LAT_MIN && lat <= BENGALURU_BOUNDS.LAT_MAX,
      {
        message: `Latitude must be within Bengaluru bounds (${BENGALURU_BOUNDS.LAT_MIN} to ${BENGALURU_BOUNDS.LAT_MAX})`,
      }
    ),
  longitude: z
    .number()
    .min(GLOBAL_BOUNDS.LNG_MIN, 'Longitude must be between -180 and 180')
    .max(GLOBAL_BOUNDS.LNG_MAX, 'Longitude must be between -180 and 180')
    .refine(
      (lng) => lng >= BENGALURU_BOUNDS.LNG_MIN && lng <= BENGALURU_BOUNDS.LNG_MAX,
      {
        message: `Longitude must be within Bengaluru bounds (${BENGALURU_BOUNDS.LNG_MIN} to ${BENGALURU_BOUNDS.LNG_MAX})`,
      }
    ),
});

// Relaxed coordinate validation for global use cases
export const globalCoordinateSchema = z.object({
  latitude: z
    .number()
    .min(GLOBAL_BOUNDS.LAT_MIN, 'Latitude must be between -90 and 90')
    .max(GLOBAL_BOUNDS.LAT_MAX, 'Latitude must be between -90 and 90'),
  longitude: z
    .number()
    .min(GLOBAL_BOUNDS.LNG_MIN, 'Longitude must be between -180 and 180')
    .max(GLOBAL_BOUNDS.LNG_MAX, 'Longitude must be between -180 and 180'),
});

// =============================================================================
// INCIDENT TYPE ENUMS
// =============================================================================

export const incidentTypeSchema = z.enum([
  'SOS',
  'TRAFFIC_VIOLATION',
  'DARK_SPOT',
  'PUBLIC_NUISANCE',
  'THEFT',
  'OTHER',
]);

export const violationTypeSchema = z.enum([
  'TRAFFIC',
  'PUBLIC_NUISANCE',
  'DARK_SPOT',
  'THEFT',
  'OTHER',
]);

export const incidentStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'RESOLVED',
]);

// =============================================================================
// SOS INCIDENT VALIDATION
// =============================================================================

export const sosIncidentSchema = z.object({
  // Location (required)
  ...coordinateSchema.shape,
  
  // Battery level (required, 0-100)
  batteryLevel: z
    .number()
    .int('Battery level must be an integer')
    .min(0, 'Battery level must be at least 0')
    .max(100, 'Battery level must be at most 100'),
  
  // Device ID (required)
  deviceId: z
    .string()
    .min(1, 'Device ID is required')
    .max(255, 'Device ID too long'),
  
  // Optional description
  description: z
    .string()
    .max(1000, 'Description too long')
    .optional(),
});

// =============================================================================
// VIOLATION INCIDENT VALIDATION
// =============================================================================

export const violationIncidentSchema = z.object({
  // Location (required)
  ...coordinateSchema.shape,
  
  // Violation type (required)
  violationType: violationTypeSchema,
  
  // Timestamp (required, ISO 8601)
  timestamp: z
    .string()
    .datetime('Invalid timestamp format. Use ISO 8601 format')
    .refine(
      (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        
        return date >= oneWeekAgo && date <= oneHourFromNow;
      },
      {
        message: 'Timestamp must be within the last week and not more than 1 hour in the future',
      }
    ),
  
  // Optional description
  description: z
    .string()
    .max(1000, 'Description too long')
    .optional(),
});

// =============================================================================
// SYNC PAYLOAD VALIDATION
// =============================================================================

export const offlineIncidentPayloadSchema = z.object({
  // Unique ID for idempotency
  id: z
    .string()
    .uuid('Invalid UUID format for payload ID'),
  
  // Payload type
  type: z.enum(['sos', 'violation']),
  
  // Payload data (union of SOS and violation schemas)
  payload: z.union([
    sosIncidentSchema,
    violationIncidentSchema,
  ]),
  
  // Client-side timestamp
  timestamp: z
    .string()
    .datetime('Invalid timestamp format. Use ISO 8601 format'),
});

export const syncRequestSchema = z.object({
  payloads: z
    .array(offlineIncidentPayloadSchema)
    .min(1, 'At least one payload is required')
    .max(100, 'Maximum 100 payloads allowed per sync request'),
});

// =============================================================================
// MAP/HEATMAP VALIDATION
// =============================================================================

export const heatmapQuerySchema = z.object({
  // Center coordinates (required)
  lat: z
    .number()
    .min(GLOBAL_BOUNDS.LAT_MIN, 'Latitude must be between -90 and 90')
    .max(GLOBAL_BOUNDS.LAT_MAX, 'Latitude must be between -90 and 90'),
  
  lng: z
    .number()
    .min(GLOBAL_BOUNDS.LNG_MIN, 'Longitude must be between -180 and 180')
    .max(GLOBAL_BOUNDS.LNG_MAX, 'Longitude must be between -180 and 180'),
  
  // Radius in kilometers (optional, default 5km, max 50km)
  radiusKm: z
    .number()
    .int('Radius must be an integer')
    .min(1, 'Radius must be at least 1km')
    .max(50, 'Radius must be at most 50km')
    .optional()
    .default(5),
  
  // Incident type filter (optional)
  type: z
    .enum(['all', 'DARK_SPOT', 'TRAFFIC', 'SOS'])
    .optional()
    .default('all'),
});

// =============================================================================
// FILE UPLOAD VALIDATION
// =============================================================================

export const fileUploadSchema = z.object({
  // File metadata
  originalname: z.string().min(1, 'Filename is required'),
  mimetype: z.string().min(1, 'MIME type is required'),
  size: z.number().positive('File size must be positive'),
  
  // File buffer or path
  buffer: z.instanceof(Buffer).optional(),
  path: z.string().optional(),
});

// Audio file validation for SOS
export const audioFileSchema = fileUploadSchema.extend({
  mimetype: z
    .string()
    .refine(
      (mimetype) => ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/aac'].includes(mimetype),
      {
        message: 'Invalid audio format. Allowed: WAV, MP3, M4A, AAC',
      }
    ),
  size: z
    .number()
    .max(10 * 1024 * 1024, 'Audio file must be smaller than 10MB'), // 10MB limit
});

// Media file validation for violations
export const mediaFileSchema = fileUploadSchema.extend({
  mimetype: z
    .string()
    .refine(
      (mimetype) => [
        'image/jpeg',
        'image/png',
        'image/webp',
        'video/mp4',
        'video/mov',
        'video/avi',
        'video/quicktime',
      ].includes(mimetype),
      {
        message: 'Invalid media format. Allowed: JPEG, PNG, WebP, MP4, MOV, AVI',
      }
    ),
  size: z
    .number()
    .max(50 * 1024 * 1024, 'Media file must be smaller than 50MB'), // 50MB limit
});

// =============================================================================
// INCIDENT DETAILS VALIDATION
// =============================================================================

export const incidentIdSchema = z.object({
  id: z
    .string()
    .uuid('Invalid incident ID format. Must be a valid UUID'),
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Validate coordinates are within reasonable bounds for the application
 */
export function validateCoordinates(lat: number, lng: number, strict: boolean = true): boolean {
  const bounds = strict ? BENGALURU_BOUNDS : GLOBAL_BOUNDS;
  
  return (
    lat >= bounds.LAT_MIN &&
    lat <= bounds.LAT_MAX &&
    lng >= bounds.LNG_MIN &&
    lng <= bounds.LNG_MAX
  );
}

/**
 * Validate file type and size for uploads
 */
export function validateFileUpload(file: any, type: 'audio' | 'media'): boolean {
  try {
    if (type === 'audio') {
      audioFileSchema.parse(file);
    } else {
      mediaFileSchema.parse(file);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get validation error messages in a user-friendly format
 */
export function getValidationErrors(error: z.ZodError): string[] {
  return error.errors.map((err) => {
    const field = err.path.join('.');
    return `${field}: ${err.message}`;
  });
}