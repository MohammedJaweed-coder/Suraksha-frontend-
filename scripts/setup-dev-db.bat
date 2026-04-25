@echo off
REM =============================================================================
REM SURAKSHA.AI BACKEND - DEVELOPMENT DATABASE SETUP SCRIPT (Windows)
REM =============================================================================
REM This script sets up a local PostgreSQL database with PostGIS for development

echo 🚀 Setting up Suraksha.ai Backend development database...

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL is not installed. Please install PostgreSQL first.
    echo   Download from https://www.postgresql.org/download/windows/
    echo   Make sure to add PostgreSQL bin directory to your PATH
    pause
    exit /b 1
)

REM Database configuration
set DB_NAME=suraksha_db
set DB_USER=postgres
set DB_HOST=localhost
set DB_PORT=5432

echo 📊 Creating database: %DB_NAME%

REM Create database if it doesn't exist
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" | findstr "1" >nul
if %ERRORLEVEL% NEQ 0 (
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "CREATE DATABASE %DB_NAME%"
)

echo 🗺️  Enabling PostGIS extension...

REM Run the initialization script
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f scripts/init-db.sql

echo ✅ Database setup complete!
echo 📝 Next steps:
echo   1. Copy .env.example to .env
echo   2. Update DATABASE_URL in .env:
echo      DATABASE_URL="postgresql://%DB_USER%:password@%DB_HOST%:%DB_PORT%/%DB_NAME%?sslmode=prefer"
echo   3. Run: npm run db:generate
echo   4. Run: npm run db:migrate
echo   5. Run: npm run db:seed

echo 🎉 Ready to start development!
pause