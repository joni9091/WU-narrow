@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 20 or newer from https://nodejs.org/
  pause
  exit /b 1
)
echo Starting Narrow AI Studio...
echo Open http://localhost:3000 in your browser.
echo Press Ctrl+C to stop.
node server.js
pause
