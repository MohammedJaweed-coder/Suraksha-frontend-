#!/bin/bash

# =============================================================================
# SURAKSHA.AI BACKEND - DEVELOPMENT DATABASE SETUP SCRIPT
# =============================================================================
# This script sets up a local PostgreSQL database with PostGIS for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up Suraksha.ai Backend development database...${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed. Please install PostgreSQL first.${NC}"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "  Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

# Check if PostGIS is available
if ! psql -c "CREATE EXTENSION IF NOT EXISTS postgis;" template1 &> /dev/null; then
    echo -e "${RED}❌ PostGIS is not available. Please install PostGIS.${NC}"
    echo "  macOS: brew install postgis"
    echo "  Ubuntu: sudo apt-get install postgis postgresql-14-postgis-3"
    echo "  Windows: Install PostGIS from https://postgis.net/windows_downloads/"
    exit 1
fi

# Database configuration
DB_NAME="suraksha_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${YELLOW}📊 Creating database: ${DB_NAME}${NC}"

# Create database if it doesn't exist
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"

echo -e "${YELLOW}🗺️  Enabling PostGIS extension...${NC}"

# Run the initialization script
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/init-db.sql

echo -e "${GREEN}✅ Database setup complete!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. Copy .env.example to .env"
echo "  2. Update DATABASE_URL in .env:"
echo "     DATABASE_URL=\"postgresql://$DB_USER:password@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=prefer\""
echo "  3. Run: npm run db:generate"
echo "  4. Run: npm run db:migrate"
echo "  5. Run: npm run db:seed"

echo -e "${GREEN}🎉 Ready to start development!${NC}"