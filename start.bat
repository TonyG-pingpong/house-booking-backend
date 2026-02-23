@echo off
title Stay ^& Book - Backend + Frontend
cd /d "%~dp0"

echo.
echo  ========================================
echo   Stay ^& Book - Starting backend + frontend
echo  ========================================
echo.
echo  Backend:   http://localhost:3000
echo  Frontend:  http://localhost:5173
echo  Network:   http://192.168.1.217:5173  ^(other devices on your Wi-Fi^)
echo.
echo  Open in browser:  http://localhost:5173
echo.
echo  Logs from [backend] and [frontend] will appear below.
echo  Press Ctrl+C to stop both.
echo  ========================================
echo.

call npm run start:all

pause
