@echo off
title EduFind Application Launcher
echo ========================================================
echo   Launching EduFind Full-Stack Application
echo ========================================================
echo.

start "EduFind Backend" cmd /k "c:\eduFind\run_backend.bat"
timeout /t 3 /nobreak >nul
start "EduFind Frontend" cmd /k "c:\eduFind\run_frontend.bat"

echo.
echo Both servers have been launched in separate windows!
echo - Frontend: http://localhost:3000
echo - Backend API: http://127.0.0.1:8000
echo - Interactive Swagger Docs: http://127.0.0.1:8000/docs
echo.
