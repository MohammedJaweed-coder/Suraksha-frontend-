import dotenv from 'dotenv';
import app from './suraksha-app';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['PORT', 'NODE_ENV', 'CORS_ORIGINS', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file');
  process.exit(1);
}

const PORT = parseInt(process.env['PORT'] || '3002');
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Suraksha.ai Dummy Backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`🔐 Authentication: Dummy JWT tokens enabled`);
  console.log(`📡 Local API: http://localhost:${PORT}/api`);
  console.log(`🌐 Network API: http://172.20.11.252:${PORT}/api`);
  console.log(`📊 Health check: http://172.20.11.252:${PORT}/api/health`);
  console.log('\n📋 Available Endpoints:');
  console.log('  POST /api/auth/login     - One-time login system');
  console.log('  GET  /api/auth/me       - Get current user info');
  console.log('  POST /api/report        - Submit report with AI validation');
  console.log('  GET  /api/report/my-reports - Get user reports');
  console.log('  POST /api/sos           - Trigger SOS alert');
  console.log('  GET  /api/sos/active    - Get active SOS alerts');
  console.log('  GET  /api/admin/overview - Dashboard statistics');
  console.log('  GET  /api/cctv          - CCTV crowd monitoring');
  console.log('  POST /api/routes        - Calculate safe routes');
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
