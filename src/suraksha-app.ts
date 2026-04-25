import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { MockDataService } from './services/mockData.service';

// Import Suraksha.ai routes
import authRoutes from './suraksha-routes/auth.routes';
import reportRoutes from './suraksha-routes/report.routes';
import sosRoutes from './suraksha-routes/sos.routes';
import adminRoutes from './suraksha-routes/admin.routes';
import cctvRoutes from './suraksha-routes/cctv.routes';
import routeRoutes from './suraksha-routes/route.routes';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false, // ✅ Disable for HTTP development
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration - Allow all origins in development
const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'role'],
};
app.use(cors(corsOptions));

// Body parsing middleware (must be before routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add explicit Content-Type handling for login endpoint
app.use((req, _res, next) => {
  // Log incoming requests for debugging
  if (req.path.includes('/auth/login')) {
    console.log(`📥 Login request: ${req.method} ${req.path}`);
    console.log(`📋 Content-Type: ${req.headers['content-type']}`);
    console.log(`📦 Body:`, req.body);
  }
  next();
});

// Request logging
if (process.env['ENABLE_REQUEST_LOGGING'] === 'true') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    mode: 'dummy',
    database: 'in-memory mock data',
    app: 'Suraksha.ai Police/Safety Platform',
    version: process.env['APP_VERSION'] || '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
  });
});

// Initialize mock data on startup
app.use((_req, _res, next) => {
  // Initialize mock data only once
  if (!(globalThis as any).surakshaMockDataInitialized) {
    MockDataService.initializeMockData();
    (globalThis as any).surakshaMockDataInitialized = true;
  }
  next();
});

// API routes (with /v1 prefix for frontend compatibility)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/report', reportRoutes);
app.use('/api/v1/sos', sosRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/cctv', cctvRoutes);
app.use('/api/v1/routes', routeRoutes);

// API routes (without /v1 prefix for backward compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cctv', cctvRoutes);
app.use('/api/routes', routeRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Suraksha.ai Police/Safety Platform API',
    version: process.env['APP_VERSION'] || '1.0.0',
    mode: 'dummy-backend',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      report: '/api/report',
      sos: '/api/sos',
      admin: '/api/admin',
      cctv: '/api/cctv',
      routes: '/api/routes',
    },
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env['NODE_ENV'] === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

export default app;