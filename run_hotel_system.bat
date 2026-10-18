@echo off
title Grand Tana Hotel Booking System Launcher
cd /d "%~dp0"

echo ==============================================================================
echo   GRAND TANA LUXURY HOTEL BOOKING SYSTEM (የሆቴል ማስያዣ ሲስተም)
echo   Starting Node.js Backend (Port 5050) & React Frontend (Port 3300)...
echo ==============================================================================
echo.

start "Hotel Backend Server (Port 5050)" cmd /k "node server.js"
cd client
start "Hotel React Frontend (Port 3300)" cmd /k "npm run dev -- --port 3300"

echo.
echo ==============================================================================
echo [SUCCESS] Both Servers are launching!
echo.
echo  - Frontend Web UI:  http://localhost:3300
echo  - Backend REST API: http://localhost:5050/api/rooms
echo ==============================================================================
timeout /t 3 >nul
start http://localhost:3300
