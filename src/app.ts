import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes';
import incidentRoutes from './routes/incidents.routes';
import mapRoutes from './routes/map.routes';
import syncRoutes from './routes/sync.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env['CORS_ORIGINS']?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: (parseInt(process.env['RATE_LIMIT_WINDOW_MINUTES'] || '15')) * 60 * 1000,
  max: parseInt(process.env['RATE_LIMIT_REQUESTS'] || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env['ENABLE_REQUEST_LOGGING'] === 'true') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    mode: 'mock',
    database: 'in-memory dummy data',
    incidents: 15,
    timestamp: new Date().toISOString(),
    version: process.env['APP_VERSION'] || '1.0.0',
    environment: process.env['NODE_ENV'] || 'development',
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/map', mapRoutes);
app.use('/api/v1/sync', syncRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Suraksha.ai Backend API',
    version: process.env['APP_VERSION'] || '1.0.0',
    mode: 'mock',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/v1/auth',
      incidents: '/api/v1/incidents',
      map: '/api/v1/map',
      sync: '/api/v1/sync',
    },
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;