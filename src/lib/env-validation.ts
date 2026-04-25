import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // JWT
  JWT_SECRET: z.string().min(64, 'JWT_SECRET must be at least 64 characters long'),
  JWT_EXPIRES_IN: z.string().optional().default('3600'),
  
  // WebAuthn
  WEBAUTHN_RP_NAME: z.string().min(1, 'WEBAUTHN_RP_NAME is required'),
  WEBAUTHN_RP_ID: z.string().min(1, 'WEBAUTHN_RP_ID is required'),
  WEBAUTHN_ORIGIN: z.string().url('WEBAUTHN_ORIGIN must be a valid URL'),
  
  // S3 Storage
  S3_ENDPOINT: z.string().url('S3_ENDPOINT must be a valid URL'),
  S3_ACCESS_KEY_ID: z.string().min(1, 'S3_ACCESS_KEY_ID is required'),
  S3_SECRET_ACCESS_KEY: z.string().min(1, 'S3_SECRET_ACCESS_KEY is required'),
  S3_BUCKET_NAME: z.string().min(1, 'S3_BUCKET_NAME is required'),
  S3_REGION: z.string().optional().default('auto'),
  
  // Server
  PORT: z.string().optional().default('3001'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).optional().default('development'),
  
  // Security
  CORS_ORIGINS: z.string().optional().default('http://localhost:3000'),
  RATE_LIMIT_REQUESTS: z.string().optional().default('100'),
  RATE_LIMIT_WINDOW_MINUTES: z.string().optional().default('15'),
  
  // File Upload Limits
  MAX_AUDIO_SIZE: z.string().optional().default('10485760'), // 10MB
  MAX_MEDIA_SIZE: z.string().optional().default('52428800'), // 50MB
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('info'),
  ENABLE_REQUEST_LOGGING: z.string().optional().default('true'),
  
  // Geospatial
  DEFAULT_RADIUS_KM: z.string().optional().default('5'),
  MAX_RADIUS_KM: z.string().optional().default('50'),
  
  // Optional
  APP_NAME: z.string().optional().default('suraksha-ai-backend'),
  APP_VERSION: z.string().optional().default('1.0.0'),
  ENABLE_HEALTH_CHECK: z.string().optional().default('true'),
  REDIS_URL: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnvironment(): Environment {
  try {
    const env = envSchema.parse(process.env);
    
    // Additional validation
    const jwtSecret = env.JWT_SECRET;
    if (jwtSecret.length < 64) {
      throw new Error('JWT_SECRET must be at least 64 characters long for security');
    }
    
    // Validate numeric values
    const port = parseInt(env.PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error('PORT must be a valid port number (1-65535)');
    }
    
    const maxAudioSize = parseInt(env.MAX_AUDIO_SIZE);
    if (isNaN(maxAudioSize) || maxAudioSize <= 0) {
      throw new Error('MAX_AUDIO_SIZE must be a positive number');
    }
    
    const maxMediaSize = parseInt(env.MAX_MEDIA_SIZE);
    if (isNaN(maxMediaSize) || maxMediaSize <= 0) {
      throw new Error('MAX_MEDIA_SIZE must be a positive number');
    }
    
    const defaultRadius = parseInt(env.DEFAULT_RADIUS_KM);
    if (isNaN(defaultRadius) || defaultRadius <= 0) {
      throw new Error('DEFAULT_RADIUS_KM must be a positive number');
    }
    
    const maxRadius = parseInt(env.MAX_RADIUS_KM);
    if (isNaN(maxRadius) || maxRadius <= 0 || maxRadius < defaultRadius) {
      throw new Error('MAX_RADIUS_KM must be a positive number greater than DEFAULT_RADIUS_KM');
    }
    
    // Validate CORS origins
    const corsOrigins = env.CORS_ORIGINS.split(',').map(origin => origin.trim());
    for (const origin of corsOrigins) {
      try {
        new URL(origin);
      } catch {
        throw new Error(`Invalid CORS origin: ${origin}. Must be a valid URL.`);
      }
    }
    
    console.log('✅ Environment validation passed');
    return env;
    
  } catch (error) {
    console.error('❌ Environment validation failed:');
    
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error(`  - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    console.error('\n📝 Please check your .env file and ensure all required variables are set.');
    console.error('💡 Copy .env.example to .env and fill in the values.\n');
    
    process.exit(1);
  }
}

// Export parsed environment for use in other modules
export const env = validateEnvironment();