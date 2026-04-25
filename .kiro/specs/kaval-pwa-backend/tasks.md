# Implementation Plan: Kaval PWA Backend

## Overview

This implementation plan follows a 5-phase approach to build the Kaval PWA Backend, a TypeScript-based REST API service for civic safety reporting in Bengaluru. The system emphasizes offline-first architecture, geospatial data processing with PostGIS, secure media handling, and evidence integrity through cryptographic chain of custody.

**Critical Note**: Phase 1 (API Contract) must be completed FIRST to enable frontend development with mocked requests.

## Tasks

### Phase 1: API Contract (OpenAPI 3.0) - PRIORITY

- [x] 1. Generate OpenAPI 3.0 specification (swagger.yaml)
  - Create comprehensive swagger.yaml with all API endpoints
  - Define request/response schemas for all endpoints
  - Include authentication flows and security definitions
  - Document geospatial query parameters and GeoJSON responses
  - Add examples for all endpoint operations
  - _Requirements: All requirements for API contract definition_

### Phase 2: Environment & Project Setup

- [x] 2. Initialize project structure and configuration
  - [x] 2.1 Create package.json with all required dependencies
    - Add Express.js, TypeScript, Prisma, @simplewebauthn/server
    - Add PostGIS support, Zod validation, Multer for file uploads
    - Add AWS SDK for S3-compatible storage (Cloudflare R2)
    - Configure development and production scripts
    - _Requirements: 10.1, 10.2_
  
  - [x] 2.2 Configure TypeScript with strict mode
    - Create tsconfig.json with strict type checking enabled
    - Configure path mapping and module resolution
    - Set up build and development configurations
    - _Requirements: 9.2_
  
  - [x] 2.3 Create environment configuration template
    - Create .env.example with all required environment variables
    - Document database connection, S3 credentials, WebAuthn settings
    - Include PostGIS configuration and file storage settings
    - _Requirements: 10.1, 10.2, 10.3_

### Phase 3: Database Schema (Prisma)

- [x] 3. Set up database schema with PostGIS support
  - [x] 3.1 Configure Prisma with PostGIS extensions
    - Create prisma/schema.prisma with postgresqlExtensions preview
    - Enable PostGIS extension in schema configuration
    - Configure database connection with spatial support
    - _Requirements: 8.1, 8.2_
  
  - [x] 3.2 Define core data models with spatial types
    - Create User model with WebAuthn credential relationships
    - Create Incident model with PostGIS geometry(Point, 4326) location
    - Create MediaFile model with chain of custody hash fields
    - Define all relationships and constraints
    - _Requirements: 8.3, 8.4, 4.1, 5.4_
  
  - [ ]* 3.3 Write property test for database schema validation
    - **Property 13: Database Referential Integrity Preservation**
    - **Validates: Requirements 8.4**
  
  - [x] 3.4 Generate and run initial migration
    - Generate Prisma migration files for schema
    - Apply migration to create tables with spatial indexes
    - Verify PostGIS geometry columns are created correctly
    - _Requirements: 8.5_

### Phase 4: Server & Core Implementation

- [x] 4. Implement Express.js server foundation
  - [x] 4.1 Create server entry point and middleware setup
    - Create src/server.ts with Express application setup
    - Configure CORS, body parsing, and security middleware
    - Set up error handling and logging middleware
    - Add environment validation on startup
    - _Requirements: 10.3, 10.5_
  
  - [ ]* 4.2 Write property test for configuration startup validation
    - **Property 10: Configuration Startup Validation**
    - **Validates: Requirements 10.3, 10.5**

- [x] 5. Implement authentication system with WebAuthn
  - [x] 5.1 Create WebAuthn service and controllers
    - Implement src/services/auth.service.ts with @simplewebauthn/server
    - Create src/controllers/auth.controller.ts with registration/authentication endpoints
    - Handle credential creation, verification, and session management
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 5.2 Write property test for WebAuthn credential verification
    - **Property 4: WebAuthn Credential Verification**
    - **Validates: Requirements 5.2, 5.3, 5.5**
  
  - [ ]* 5.3 Write unit tests for authentication flows
    - Test credential registration edge cases
    - Test authentication failure scenarios
    - _Requirements: 5.5_

- [x] 6. Implement input validation with Zod
  - [x] 6.1 Create Zod validation schemas
    - Create src/schemas/ directory with validation schemas
    - Define schemas for all API endpoints and data models
    - Include geospatial coordinate validation with bounds checking
    - _Requirements: 9.1, 9.3, 9.4_
  
  - [ ]* 6.2 Write property test for input validation error handling
    - **Property 7: Input Validation Error Handling**
    - **Validates: Requirements 9.3**
  
  - [ ]* 6.3 Write property test for geospatial coordinate validation
    - **Property 12: Geospatial Coordinate Validation**
    - **Validates: Requirements 9.4**

- [x] 7. Implement media upload and chain of custody system
  - [x] 7.1 Create media service with S3 streaming
    - Implement src/services/media.service.ts with Multer and AWS SDK
    - Configure streaming uploads to Cloudflare R2
    - Add file type validation and size limit enforcement
    - _Requirements: 3.1, 3.2, 3.4_
  
  - [x] 7.2 Implement SHA-256 chain of custody system
    - Create src/services/chainOfCustody.service.ts
    - Compute and store SHA-256 hashes for all uploaded files
    - Implement hash verification and audit trail functionality
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 7.3 Write property test for chain of custody hash consistency
    - **Property 3: Chain of Custody Hash Consistency**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  
  - [ ]* 7.4 Write property test for media file chain of custody round-trip
    - **Property 11: Media File Chain of Custody Round-Trip**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  
  - [ ]* 7.5 Write property test for file upload validation
    - **Property 8: File Upload Validation**
    - **Validates: Requirements 3.4, 9.5**

- [x] 8. Checkpoint - Ensure core services are functional
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement incident reporting system
  - [ ] 9.1 Create incident service and controllers
    - Implement src/services/incident.service.ts with priority processing
    - Create src/controllers/incidents.controller.ts (full implementation, not stub)
    - Handle SOS requests with critical priority processing
    - Coordinate with media service for file attachments
    - Store incident locations using PostGIS geometry types
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 9.2 Write property test for SOS priority processing
    - **Property 5: SOS Priority Processing**
    - **Validates: Requirements 6.1, 6.2**
  
  - [ ]* 9.3 Write property test for incident location storage accuracy
    - **Property 9: Incident Location Storage Accuracy**
    - **Validates: Requirements 6.5, 8.3**
  
  - [ ]* 9.4 Write unit tests for incident controllers
    - Test SOS vs violation report handling
    - Test media attachment processing
    - _Requirements: 6.1, 6.2, 6.4_

- [ ] 10. Implement geospatial query engine
  - [ ] 10.1 Create geospatial service with PostGIS operations
    - Implement src/services/geospatial.service.ts with PostGIS functions
    - Add radius-based queries and spatial indexing
    - Implement dark spot identification algorithms
    - Optimize queries for 50km radius performance requirements
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  
  - [ ]* 10.2 Write property test for geospatial query boundary accuracy
    - **Property 2: Geospatial Query Boundary Accuracy**
    - **Validates: Requirements 2.2**

- [ ] 11. Implement map and heatmap services
  - [ ] 11.1 Create map service and controllers
    - Implement src/services/map.service.ts with heatmap generation
    - Create src/controllers/map.controller.ts (full implementation, not stub)
    - Generate GeoJSON responses for mapping libraries
    - Implement caching for frequently requested map data
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 11.2 Write property test for GeoJSON format compliance
    - **Property 6: GeoJSON Format Compliance**
    - **Validates: Requirements 2.4, 7.2**
  
  - [ ]* 11.3 Write property test for map service caching consistency
    - **Property 14: Map Service Caching Consistency**
    - **Validates: Requirements 7.5**

- [ ] 12. Implement offline synchronization system
  - [ ] 12.1 Create sync service with idempotency guarantees
    - Implement src/services/sync.service.ts for bulk payload processing
    - Add idempotency checks using payload identifiers
    - Handle offline-buffered requests with duplicate prevention
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 12.2 Write property test for sync payload idempotency
    - **Property 1: Sync Payload Idempotency**
    - **Validates: Requirements 1.4, 1.5**
  
  - [ ]* 12.3 Write unit tests for sync service
    - Test duplicate payload handling
    - Test bulk processing scenarios
    - _Requirements: 1.4, 1.5_

- [ ] 13. Wire all components together and create API routes
  - [ ] 13.1 Create comprehensive API routing
    - Create src/routes/ directory with all endpoint definitions
    - Wire authentication, incidents, map, sync, and media routes
    - Apply validation middleware to all endpoints
    - Add rate limiting and security middleware
    - _Requirements: All API endpoint requirements_
  
  - [ ] 13.2 Integrate all services into Express application
    - Connect all controllers and services to main application
    - Configure middleware chain and error handling
    - Set up database connection and initialization
    - _Requirements: All integration requirements_

### Phase 5: Database Seed File

- [ ] 14. Create comprehensive seed data for Bengaluru
  - [ ] 14.1 Implement database seed file with Bengaluru locations
    - Create prisma/seed.ts with 15 location-based dummy records
    - Include specific Bengaluru coordinates: Koramangala (12.9352, 77.6245)
    - Add Silk Board (12.9165, 77.6101), Indiranagar (12.9719, 77.6412)
    - Include MG Road (12.9716, 77.5946), Whitefield (12.9698, 77.7500)
    - Create mix of SOS requests and violation reports with realistic data
    - Add sample media file references and chain of custody hashes
    - Include various incident types and priority levels
    - _Requirements: Database seeding for development and testing_
  
  - [ ] 14.2 Configure seed script execution
    - Add seed script to package.json
    - Configure Prisma to run seed on database reset
    - Ensure seed data includes proper PostGIS geometry formatting
    - _Requirements: Development environment setup_

- [ ] 15. Final integration and testing checkpoint
  - [ ] 15.1 Verify all API endpoints are functional
    - Test all authentication flows end-to-end
    - Verify geospatial queries return correct GeoJSON
    - Test file upload and chain of custody verification
    - Validate offline sync with sample payloads
    - _Requirements: All functional requirements_
  
  - [ ] 15.2 Ensure all tests pass and system is deployment-ready
    - Run complete test suite including property tests
    - Verify database migrations and seed data work correctly
    - Test environment configuration validation
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Phase 1 (swagger.yaml) is critical and must be completed FIRST for frontend development
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- PostGIS geometry types use `Unsupported("geometry(Point, 4326)")` syntax in Prisma
- WebAuthn implementation uses @simplewebauthn/server library
- File uploads stream directly to S3/R2 with SHA-256 hashing
- Bengaluru seed data includes realistic coordinates for local development
- All controllers (incidents.controller.ts, map.controller.ts) are fully implemented, not stubs