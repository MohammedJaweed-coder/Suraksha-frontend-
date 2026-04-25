-- =============================================================================
-- SURAKSHA.AI BACKEND - DATABASE INITIALIZATION SCRIPT
-- =============================================================================
-- This script initializes the PostgreSQL database with PostGIS extension
-- Run this script before running Prisma migrations

-- Enable PostGIS extension (required for spatial operations)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS installation
SELECT PostGIS_Version();

-- Create spatial reference system if not exists (WGS84 - EPSG:4326)
-- This is the standard GPS coordinate system
INSERT INTO spatial_ref_sys (srid, auth_name, auth_srid, proj4text, srtext)
SELECT 4326, 'EPSG', 4326, 
       '+proj=longlat +datum=WGS84 +no_defs',
       'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]'
WHERE NOT EXISTS (SELECT 1 FROM spatial_ref_sys WHERE srid = 4326);

-- Grant necessary permissions for PostGIS functions
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT CREATE ON SCHEMA public TO PUBLIC;

-- Create indexes for better performance (will be created by Prisma migrations)
-- These are just examples of what Prisma will create

-- Example spatial index (Prisma will create this):
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS incidents_location_idx 
-- ON incidents USING GIST (location);

-- Example composite indexes (Prisma will create these):
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS incidents_type_status_idx 
-- ON incidents (type, status);

-- CREATE INDEX CONCURRENTLY IF NOT EXISTS incidents_created_at_idx 
-- ON incidents (created_at);

-- Verify PostGIS functions are available
SELECT 'PostGIS functions available' AS status
WHERE EXISTS (
  SELECT 1 FROM pg_proc 
  WHERE proname = 'st_dwithin'
);

-- Display PostGIS version and capabilities
SELECT 
  PostGIS_Version() AS postgis_version,
  PostGIS_Full_Version() AS full_version;