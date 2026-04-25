# Requirements Document

## Introduction

The Kaval PWA Backend is a comprehensive civic tech platform backend service for Bengaluru Sentinel (Track A Police/Safety application). This system provides offline-first synchronization, geospatial queries, secure media handling, and chain of custody for evidence integrity in civic safety reporting.

## Glossary

- **PWA_Client**: The Progressive Web Application frontend that interacts with this backend
- **Sync_Service**: The backend service component responsible for processing offline-buffered payloads
- **Geospatial_Engine**: The PostGIS-powered component that handles location-based queries
- **Media_Handler**: The service component responsible for secure file uploads and storage
- **Chain_of_Custody_System**: The component that computes and stores SHA-256 hashes for evidence integrity
- **Auth_Service**: The WebAuthn-based authentication service using biometric authentication
- **Incident_Service**: The service handling SOS and violation reporting
- **Map_Service**: The service providing heatmap and geospatial data via GeoJSON
- **Database**: PostgreSQL database with PostGIS extension
- **File_Storage**: AWS S3-compatible storage system (Cloudflare R2 preferred)
- **Offline_Payload**: Data collected by PWA while offline and buffered for later synchronization
- **Dark_Spot**: A location identified as having safety concerns or incidents
- **SOS_Request**: Critical priority emergency request requiring immediate attention
- **Violation_Report**: Non-emergency safety violation report with supporting evidence

## Requirements

### Requirement 1: Offline-First Synchronization

**User Story:** As a citizen using the PWA in areas with poor connectivity, I want my safety reports to be cached locally when offline, so that I can still report incidents even without internet access.

#### Acceptance Criteria

1. WHEN the PWA_Client is offline and submits a safety report, THE PWA_Client SHALL cache the request locally
2. WHEN the PWA_Client regains connectivity, THE PWA_Client SHALL send cached requests to the Sync_Service
3. THE Sync_Service SHALL expose an endpoint at /api/v1/sync for bulk processing
4. WHEN the Sync_Service receives offline payloads, THE Sync_Service SHALL process each payload with idempotency guarantees
5. WHEN duplicate payloads are received, THE Sync_Service SHALL prevent duplicate processing using payload identifiers

### Requirement 2: Geospatial Query Processing

**User Story:** As a safety analyst, I want to query incidents within specific geographic areas, so that I can identify patterns and hotspots for targeted interventions.

#### Acceptance Criteria

1. THE Geospatial_Engine SHALL use PostGIS extension for spatial operations
2. WHEN a radius query is requested, THE Geospatial_Engine SHALL return all incidents within the specified distance
3. WHEN querying for dark spots near Bengaluru city centre, THE Geospatial_Engine SHALL return results within 5km radius
4. THE Geospatial_Engine SHALL return query results in GeoJSON format
5. WHEN processing geospatial queries, THE Geospatial_Engine SHALL complete operations within 2 seconds for queries covering up to 50km radius

### Requirement 3: Secure Media Upload and Storage

**User Story:** As a citizen reporting a safety violation, I want to upload photos and audio evidence securely, so that my evidence is preserved and protected from tampering.

#### Acceptance Criteria

1. THE Media_Handler SHALL accept multipart/form-data uploads for violation images and SOS audio clips
2. WHEN media files are uploaded, THE Media_Handler SHALL stream files directly to S3-compatible storage
3. THE Media_Handler SHALL use Cloudflare R2 as the preferred storage backend
4. WHEN processing file uploads, THE Media_Handler SHALL validate file types and size limits
5. THE Media_Handler SHALL generate secure URLs for accessing uploaded media files

### Requirement 4: Chain of Custody Evidence Integrity

**User Story:** As a law enforcement officer, I want cryptographic proof that evidence hasn't been tampered with, so that I can trust the integrity of citizen-reported evidence.

#### Acceptance Criteria

1. WHEN any file is uploaded, THE Chain_of_Custody_System SHALL compute a SHA-256 hash
2. THE Chain_of_Custody_System SHALL store the hash value in the Database immediately after upload
3. WHEN evidence is accessed, THE Chain_of_Custody_System SHALL provide hash verification capabilities
4. THE Chain_of_Custody_System SHALL maintain an immutable audit trail of all hash computations
5. WHEN hash verification is requested, THE Chain_of_Custody_System SHALL return verification results within 100ms

### Requirement 5: WebAuthn Biometric Authentication

**User Story:** As a user concerned about security, I want to use biometric authentication instead of passwords, so that my account is more secure and convenient to access.

#### Acceptance Criteria

1. THE Auth_Service SHALL implement WebAuthn using @simplewebauthn/server library
2. WHEN a user registers, THE Auth_Service SHALL support biometric credential creation
3. WHEN a user authenticates, THE Auth_Service SHALL verify biometric credentials
4. THE Auth_Service SHALL maintain user credential mappings in the Database
5. WHEN authentication fails, THE Auth_Service SHALL return appropriate error codes and messages

### Requirement 6: Incident Reporting System

**User Story:** As a citizen, I want to report both emergency SOS requests and non-emergency violations with supporting media, so that appropriate authorities can respond effectively.

#### Acceptance Criteria

1. THE Incident_Service SHALL handle SOS requests with critical priority processing
2. THE Incident_Service SHALL handle violation reports with standard priority processing
3. WHEN an SOS request is received, THE Incident_Service SHALL process it within 5 seconds
4. WHEN a violation report includes media, THE Incident_Service SHALL coordinate with Media_Handler for file processing
5. THE Incident_Service SHALL store incident location data using PostGIS geometry types

### Requirement 7: Map and Heatmap Services

**User Story:** As a safety coordinator, I want to visualize incident patterns on a map with heatmap overlays, so that I can identify areas requiring increased safety measures.

#### Acceptance Criteria

1. THE Map_Service SHALL generate heatmap data based on incident density
2. WHEN heatmap data is requested, THE Map_Service SHALL return GeoJSON format responses
3. THE Map_Service SHALL support radius-based queries for incident clustering
4. WHEN processing map requests, THE Map_Service SHALL apply appropriate geographic projections
5. THE Map_Service SHALL cache frequently requested map data for performance optimization

### Requirement 8: Database and ORM Integration

**User Story:** As a developer, I want type-safe database operations with spatial data support, so that I can build reliable geospatial features with confidence.

#### Acceptance Criteria

1. THE Database SHALL use PostgreSQL with PostGIS extension enabled
2. THE Database SHALL be accessed through Prisma ORM with postgresqlExtensions preview feature
3. WHEN spatial queries are executed, THE Database SHALL use PostGIS functions for geometric operations
4. THE Database SHALL maintain referential integrity across all related entities
5. WHEN database migrations are applied, THE Database SHALL preserve existing spatial data and indexes

### Requirement 9: Input Validation and Type Safety

**User Story:** As a system administrator, I want all API inputs to be validated and type-checked, so that the system is protected from malformed data and security vulnerabilities.

#### Acceptance Criteria

1. THE API SHALL use Zod for runtime input validation on all endpoints
2. THE API SHALL implement TypeScript in strict mode for compile-time type safety
3. WHEN invalid input is received, THE API SHALL return descriptive error messages with HTTP 400 status
4. THE API SHALL validate geospatial coordinates for reasonable bounds and format
5. WHEN file uploads are processed, THE API SHALL validate file types, sizes, and content headers

### Requirement 10: Environment Configuration and Deployment

**User Story:** As a DevOps engineer, I want secure environment configuration management, so that I can deploy the system safely across different environments.

#### Acceptance Criteria

1. THE System SHALL use dotenv for environment variable management
2. THE System SHALL require all sensitive configuration values to be provided via environment variables
3. WHEN the system starts, THE System SHALL validate that all required environment variables are present
4. THE System SHALL support different configuration profiles for development, staging, and production
5. WHEN configuration errors occur, THE System SHALL fail fast with clear error messages during startup