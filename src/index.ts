import dotenv from 'dotenv';
import app from './app';
import { validateEnvironment } from './lib/env-validation';

// Load environment variables
dotenv.config();

// Validate environment variables on startup
validateEnvironment();

const PORT = process.env['PORT'] || 3001;

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Suraksha.ai Backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`🗺️  PostGIS enabled for geospatial queries`);
  console.log(`🔐 WebAuthn biometric authentication ready`);
  console.log(`☁️  S3-compatible storage configured`);
  console.log(`📡 API available at: http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});