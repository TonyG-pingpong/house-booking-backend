@echo off
setlocal
cd /d "%~dp0\.."
node scripts/set-mobile-env.js
pause
