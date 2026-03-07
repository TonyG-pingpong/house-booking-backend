@echo off
title Stay ^& Book - Backend + Frontend
cd /d "%~dp0"

REM On Mac or Linux, use start.sh instead (in the same folder).
REM This file is for Windows only.

echo.
node scripts/start.js
pause
