# Database Setup Guide

This guide walks you through setting up the PostgreSQL database with PostGIS extension for the Suraksha.ai Backend.

## Prerequisites

### 1. PostgreSQL Installation

**macOS (using Homebrew):**
```bash
brew install postgresql
brew install postgis
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo apt-get install postgis postgresql-14-postgis-3
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Download PostGIS from https://postgis.net/windows_downloads/
3. Install PostgreSQL first, then PostGIS
4. Add PostgreSQL bin directory to your PATH

### 2. Verify Installation

```bash
# Check PostgreSQL version
psql --version

# Check PostGIS availability
psql -c "CREATE EXTENSION IF NOT EXISTS postgis;" template1
```

## Database Setup

### Option 1: Automated Setup (Recommended)

**Linux/macOS:**
```bash
./scripts/setup-dev-db.sh
```

**Windows:**
```cmd
scripts\setup-dev-db.bat
```

### Option 2: Manual Setup

1. **Create Database:**
   ```bash
   createdb suraksha_db
   ```

2. **Enable PostGIS:**
   ```bash
   psql -d suraksha_db -f scripts/init-db.sql
   ```

3. **Verify PostGIS:**
   ```bash
   psql -d suraksha_db -c "SELECT PostGIS_Version();"
   ```

## Environment Configuration

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Update DATABASE_URL in .env:**
   ```env
   DATABASE_URL="postgresql://postgres:your-password@localhost:5432/suraksha_db?sslmode=prefer"
   ```

## Prisma Setup

1. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

2. **Create and run migrations:**
   ```bash
   npm run db:migrate
   ```

3. **Seed database with sample data:**
   ```bash
   npm run db:seed
   ```

## Database Schema Overview

### Core Models

#### User
- Stores WebAuthn credentials and device information
- Supports biometric authentication
- Links to reported incidents

#### Incident
- **PostGIS Geometry**: Uses `geometry(Point, 4326)` for spatial queries
- **Redundant Coordinates**: Stores lat/lng as Float for non-GIS queries
- **Types**: SOS, TRAFFIC_VIOLATION, DARK_SPOT, PUBLIC_NUISANCE, THEFT, OTHER
- **Status**: PENDING, IN_PROGRESS, RESOLVED
- **Spatial Index**: GIST index on location field for performance

#### Media
- Stores file metadata and S3 URLs
- **Chain of Custody**: SHA-256 file hash for integrity
- **Types**: IMAGE, VIDEO, AUDIO
- Links to incidents with cascade delete

### Spatial Features

The database uses PostGIS for advanced geospatial operations:

- **Point Storage**: `geometry(Point, 4326)` in WGS84 coordinate system
- **Spatial Indexing**: GIST indexes for fast radius queries
- **Distance Queries**: ST_DWithin() for efficient proximity searches
- **Coordinate Validation**: Proper bounds checking for lat/lng values

### Performance Optimizations

- **Spatial Index**: GIST index on incident locations
- **Composite Indexes**: On type+status, timestamps
- **Hash Index**: On file hashes for chain of custody lookups
- **Foreign Key Indexes**: For efficient joins

## Common Operations

### Spatial Queries

**Find incidents within 5km of a point:**
```sql
SELECT * FROM incidents 
WHERE ST_DWithin(
  location, 
  ST_MakePoint(77.5946, 12.9716)::geometry, 
  5000  -- 5km in meters
);
```

**Calculate distance between points:**
```sql
SELECT 
  id,
  ST_Distance(location, ST_MakePoint(77.5946, 12.9716)::geometry) as distance_meters
FROM incidents;
```

### Chain of Custody Verification

**Verify file integrity:**
```sql
SELECT 
  m.id,
  m.file_hash,
  i.type as incident_type
FROM media m
JOIN incidents i ON m.incident_id = i.id
WHERE m.file_hash = 'sha256-hash-here';
```

## Troubleshooting

### PostGIS Extension Issues

**Error: "extension postgis does not exist"**
```bash
# Install PostGIS packages
sudo apt-get install postgis postgresql-14-postgis-3

# Enable extension manually
psql -d suraksha_db -c "CREATE EXTENSION postgis;"
```

### Migration Issues

**Error: "relation does not exist"**
```bash
# Reset and recreate migrations
npm run db:reset
npm run db:migrate
```

**Error: "geometry type not supported"**
- Ensure PostGIS extension is enabled before running migrations
- Check that `postgresqlExtensions = [postgis]` is in schema.prisma

### Connection Issues

**Error: "connection refused"**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

**Error: "authentication failed"**
- Check username/password in DATABASE_URL
- Verify PostgreSQL user permissions
- Check pg_hba.conf for authentication settings

## Production Considerations

### Managed Database Services

**Supabase:**
- PostGIS enabled by default
- Connection string format: `postgresql://postgres:password@db.project.supabase.co:5432/postgres?sslmode=require`

**Neon:**
- PostGIS available on paid plans
- Connection string format: `postgresql://user:password@ep-name.region.aws.neon.tech/dbname?sslmode=require`

**AWS RDS:**
- Enable PostGIS extension manually
- Use RDS Proxy for connection pooling
- Enable SSL connections

### Performance Tuning

1. **Spatial Indexes**: Ensure GIST indexes on geometry columns
2. **Connection Pooling**: Use PgBouncer or RDS Proxy
3. **Query Optimization**: Use EXPLAIN ANALYZE for spatial queries
4. **Vacuum**: Regular VACUUM ANALYZE for spatial tables

### Backup and Recovery

```bash
# Backup with spatial data
pg_dump -Fc suraksha_db > suraksha_backup.dump

# Restore
pg_restore -d kaval_db kaval_backup.dump
```

## Security

1. **SSL Connections**: Always use `sslmode=require` in production
2. **User Permissions**: Create dedicated database user with minimal permissions
3. **Network Security**: Restrict database access to application servers only
4. **Encryption**: Enable encryption at rest for sensitive data