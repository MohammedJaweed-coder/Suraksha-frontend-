@echo off
echo Fixing Vite port 5173 issue...
echo.

REM Kill any node processes that might be holding the port
echo Killing any existing node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Port 5173 should now be free.
echo.
echo You can now run: npm run dev
echo.
pause
