@echo off
setlocal
title House Booking - Mobile App (Browser)
cd /d "%~dp0\.."

set "MOBILE_DIR=%~dp0..\mobile-app"
if not exist "%MOBILE_DIR%\package.json" (
    echo  Error: mobile-app not found. Run from project root.
    pause
    exit /b 1
)

echo.
echo  ========================================
echo   House Booking - Mobile App in Browser
echo  ========================================
echo.
echo  Ensure start.bat is running (backend).
echo  Open in browser:  http://localhost:5174
echo.
echo  Press Ctrl+C to stop the dev server.
echo  ========================================
echo.

cd /d "%MOBILE_DIR%"
call npm run dev

pause
