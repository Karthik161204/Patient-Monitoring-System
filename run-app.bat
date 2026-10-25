@echo off
echo ========================================================
echo Starting Hospital Appointment Booking System...
echo ========================================================

start "Backend Server (Port 5000)" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend Client (Port 3000)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Backend running on http://localhost:5000
echo Frontend running on http://localhost:3000
echo.
echo Login Credentials (all passwords: password123):
echo - Admin:   admin@hospital.com
echo - Doctor:  kumar@hospital.com
echo - Patient: patient@hospital.com
echo ========================================================
