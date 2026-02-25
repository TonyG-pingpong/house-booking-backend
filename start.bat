@echo off
title Stay ^& Book - Backend + Frontend
cd /d "%~dp0"

echo.
echo  ========================================
echo   Stay ^& Book - Starting backend + frontend
echo  ========================================
echo.

echo  Stopping any existing backend (3000) and frontend (5173)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" 2>nul
timeout /t 2 /nobreak >nul
echo  Starting backend + frontend...
echo.

echo  Backend:   http://localhost:3000
echo  Frontend:  http://localhost:5173
echo  Network:   http://192.168.1.217:5173  ^(other devices on your Wi-Fi^)
echo.
echo  Open in browser:  http://localhost:5173
echo.
echo  Mobile app (separate):  cd mobile-app, then npm run dev  -  http://localhost:5174
echo  See docs\STARTING-THE-APPS.md for backend + web + mobile and device/emulator.
echo.
echo  Logs from [backend] and [frontend] will appear below.
echo  Press Ctrl+C to stop both.
echo  ========================================
echo.

call npm run start:all

pause
