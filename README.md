# Suraksha.ai Backend

Comprehensive civic tech platform backend service for Suraksha.ai (Track A Police/Safety application).

## Features

- 🔐 **WebAuthn Biometric Authentication** - Secure passwordless authentication
- 🚨 **Critical Priority SOS Processing** - Emergency incidents processed within 5 seconds
- 🗺️ **Geospatial Queries with PostGIS** - Radius-based incident mapping and heatmaps
- 📱 **Offline-First Sync** - Bulk processing of offline-buffered payloads
- 🔒 **Chain of Custody** - SHA-256 hashing for tamper-proof evidence
- ☁️ **S3-Compatible Storage** - Secure media upload to Cloudflare R2
- 📊 **GeoJSON API** - Compatible with react-leaflet and mapping libraries

## Tech Stack

- **Runtime**: Node.js 18+ with Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with PostGIS extension
- **ORM**: Prisma with spatial extensions
- **Authentication**: @simplewebauthn/server
- **File Storage**: AWS S3-compatible (Cloudflare R2 preferred)
- **Validation**: Zod for runtime type checking

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ with PostGIS 3.2+
- S3-compatible storage (Cloudflare R2 recommended)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd suraksha-ai-backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration values
   ```

3. **Set up database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed with sample data
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001/api/v1`

## API Documentation

The complete API specification is available in `swagger.yaml`. Key endpoints:

### Authentication
- `POST /api/v1/auth/generate-registration-options` - WebAuthn registration
- `POST /api/v1/auth/verify-registration` - Complete registration
- `POST /api/v1/auth/generate-authentication-options` - WebAuthn login
- `POST /api/v1/auth/verify-authentication` - Verify authentication

### Incidents
- `POST /api/v1/incidents/sos` - Report emergency (CRITICAL PRIORITY)
- `POST /api/v1/incidents/violation` - Report safety violation
- `GET /api/v1/incidents/{id}` - Get incident details

### Map & Geospatial
- `GET /api/v1/map/heatmap` - Get incident heatmap (GeoJSON)

### Sync
- `POST /api/v1/sync` - Bulk process offline payloads

## Database Schema

The application uses PostgreSQL with PostGIS for spatial data:

- **User** - WebAuthn credentials and user profiles
- **Incident** - SOS and violation reports with PostGIS geometry
- **Media** - File metadata with SHA-256 chain of custody hashes

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run test suite
- `npm run lint` - Lint TypeScript code
- `npm run type-check` - Type check without emitting

### Database Commands

- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database (⚠️ destructive)

## Configuration

Key environment variables (see `.env.example` for complete list):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (min 64 chars)
- `WEBAUTHN_*` - WebAuthn configuration
- `S3_*` - S3-compatible storage settings
- `PORT` - Server port (default: 3001)

## Security Features

- **Input Validation** - Zod schemas for all endpoints
- **Rate Limiting** - Configurable per-IP limits
- **CORS Protection** - Configurable allowed origins
- **File Upload Security** - Type and size validation
- **Chain of Custody** - Cryptographic file integrity
- **WebAuthn** - Biometric authentication

## Performance

- **API Response Time**: < 200ms for standard operations
- **Geospatial Queries**: < 2 seconds for 50km radius
- **File Upload**: Up to 50MB with streaming
- **Concurrent Users**: 1000+ supported

## Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Configure production database with PostGIS
3. Set up Cloudflare R2 or AWS S3
4. Configure proper CORS origins
5. Set strong JWT secret
6. Enable SSL/TLS
7. Set up monitoring and logging

### Docker Support

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and type checking
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Email: support@suraksha.ai