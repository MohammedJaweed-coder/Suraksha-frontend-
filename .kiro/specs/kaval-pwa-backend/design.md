# Kaval PWA Backend Design Document

## System Overview

The Kaval PWA Backend is a Node.js/TypeScript-based REST API service designed to support the Bengaluru Sentinel civic safety reporting application. The system emphasizes offline-first architecture, geospatial data processing, secure media handling, and evidence integrity through cryptographic chain of custody.

## Architecture

### Core Components

1. **Express.js API Server**: RESTful API with TypeScript strict mode
2. **PostgreSQL + PostGIS**: Spatial database for geospatial operations
3. **Prisma ORM**: Type-safe database access with spatial extensions
4. **WebAuthn Authentication**: Biometric authentication using @simplewebauthn/server
5. **S3-Compatible Storage**: Media storage via Cloudflare R2 with Multer
6. **Zod Validation**: Runtime input validation and type checking

### API Endpoints

#### Authentication Endpoints
- `POST /api/v1/auth/register` - WebAuthn credential registration
- `POST /api/v1/auth/authenticate` - WebAuthn credential verification
- `POST /api/v1/auth/logout` - Session termination

#### Incident Management
- `POST /api/v1/incidents/sos` - Critical priority SOS reporting
- `POST /api/v1/incidents/violation` - Standard violation reporting with media
- `GET /api/v1/incidents` - Query incidents with geospatial filters
- `GET /api/v1/incidents/:id` - Retrieve specific incident details

#### Map and Geospatial Services
- `GET /api/v1/map/heatmap` - Generate incident density heatmaps
- `GET /api/v1/map/radius` - Radius-based incident queries
- `GET /api/v1/map/darkspots` - Identify high-risk areas

#### Offline Synchronization
- `POST /api/v1/sync` - Bulk processing of offline-buffered payloads
- `GET /api/v1/sync/status` - Synchronization status and health

#### Media Management
- `POST /api/v1/media/upload` - Secure multipart file upload
- `GET /api/v1/media/:id` - Retrieve media with chain of custody verification

### Data Models

#### Incident Schema
```typescript
interface Incident {
  id: string;
  type: 'SOS' | 'VIOLATION';
  location: PostGISGeometry;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  reporterId: string;
  mediaFiles: MediaFile[];
  timestamp: Date;
  chainOfCustodyHash: string;
}
```

#### Media File Schema
```typescript
interface MediaFile {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  sha256Hash: string;
  storageUrl: string;
  uploadTimestamp: Date;
  incidentId: string;
}
```

#### User Schema
```typescript
interface User {
  id: string;
  webauthnCredentials: WebAuthnCredential[];
  profile: UserProfile;
  createdAt: Date;
  lastLoginAt: Date;
}
```

### Security Considerations

1. **Input Validation**: All inputs validated using Zod schemas
2. **File Upload Security**: Content-type validation, size limits, virus scanning
3. **Chain of Custody**: SHA-256 hashing for evidence integrity
4. **Authentication**: WebAuthn biometric authentication
5. **Authorization**: Role-based access control for sensitive operations
6. **Rate Limiting**: API rate limiting to prevent abuse
7. **CORS Configuration**: Proper CORS setup for PWA integration

### Performance Requirements

- **API Response Time**: < 200ms for standard operations
- **Geospatial Queries**: < 2 seconds for 50km radius queries
- **File Upload**: Support up to 50MB files with streaming
- **Concurrent Users**: Support 1000+ concurrent connections
- **Database Queries**: Optimized spatial indexes for PostGIS operations

### Scalability Design

1. **Horizontal Scaling**: Stateless API design for load balancing
2. **Database Optimization**: Spatial indexes and query optimization
3. **Caching Strategy**: Redis for session management and query caching
4. **CDN Integration**: Media delivery via CDN for global performance
5. **Background Processing**: Queue-based processing for heavy operations

## Technology Stack

- **Runtime**: Node.js 18+ with Express.js framework
- **Language**: TypeScript with strict mode enabled
- **Database**: PostgreSQL 14+ with PostGIS 3.2+ extension
- **ORM**: Prisma with postgresqlExtensions preview feature
- **Authentication**: @simplewebauthn/server for WebAuthn implementation
- **File Storage**: AWS S3-compatible API (Cloudflare R2 preferred)
- **Validation**: Zod for runtime type checking and validation
- **Environment**: dotenv for configuration management
- **File Upload**: Multer middleware for multipart/form-data handling

## Deployment Architecture

### Development Environment
- Local PostgreSQL with PostGIS
- Local S3-compatible storage (MinIO)
- Hot reload with nodemon
- Development-specific logging and debugging

### Production Environment
- Managed PostgreSQL with PostGIS (AWS RDS/Google Cloud SQL)
- Cloudflare R2 for media storage
- Load balancer with SSL termination
- Monitoring and alerting integration
- Automated backup and disaster recovery

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Sync Payload Idempotency

*For any* offline payload with a unique identifier, processing it multiple times should produce the same database state as processing it once, ensuring no duplicate incidents are created.

**Validates: Requirements 1.4, 1.5**

### Property 2: Geospatial Query Boundary Accuracy

*For any* valid coordinate and radius, all returned incidents should be within the specified geographic distance, and no incidents within those bounds should be omitted from results.

**Validates: Requirements 2.2**

### Property 3: Chain of Custody Hash Consistency

*For any* uploaded file, the computed SHA-256 hash should remain identical across all subsequent retrievals and verifications, maintaining evidence integrity.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 4: WebAuthn Credential Verification

*For any* authentication attempt, valid WebAuthn credentials should grant access while invalid credentials should be consistently rejected with appropriate error responses.

**Validates: Requirements 5.2, 5.3, 5.5**

### Property 5: SOS Priority Processing

*For any* mixed batch of SOS requests and violation reports, SOS requests should be processed before violation reports, ensuring critical incidents receive priority.

**Validates: Requirements 6.1, 6.2**

### Property 6: GeoJSON Format Compliance

*For any* geospatial query response, the returned data should conform to valid GeoJSON specification and be parseable by standard mapping libraries.

**Validates: Requirements 2.4, 7.2**

### Property 7: Input Validation Error Handling

*For any* API endpoint receiving invalid input, the system should return HTTP 400 status with descriptive error messages, while valid input should be processed successfully.

**Validates: Requirements 9.3**

### Property 8: File Upload Validation

*For any* file upload attempt, files exceeding size limits or having invalid content types should be rejected, while valid files should be accepted and stored with proper hash computation.

**Validates: Requirements 3.4, 9.5**

### Property 9: Incident Location Storage Accuracy

*For any* incident report with location data, the coordinates should be stored as valid PostGIS geometry and be retrievable through spatial queries with correct geographic positioning.

**Validates: Requirements 6.5, 8.3**

### Property 10: Configuration Startup Validation

*For any* system startup attempt, missing required environment variables should cause immediate failure with clear error messages, while complete valid configuration should allow successful initialization.

**Validates: Requirements 10.3, 10.5**

### Property 11: Media File Chain of Custody Round-Trip

*For any* uploaded media file, storing the file and computing its hash, then retrieving and verifying the hash should confirm the file's integrity and authenticity.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 12: Geospatial Coordinate Validation

*For any* coordinate input to geospatial endpoints, coordinates outside reasonable geographic bounds should be rejected, while valid coordinates should be accepted and processed correctly.

**Validates: Requirements 9.4**

### Property 13: Database Referential Integrity Preservation

*For any* database operation that could violate referential integrity constraints, the operation should be rejected, while valid operations should maintain all entity relationships.

**Validates: Requirements 8.4**

### Property 14: Map Service Caching Consistency

*For any* frequently requested map data, subsequent identical requests should return the same cached results, ensuring consistent performance and data accuracy.

**Validates: Requirements 7.5**