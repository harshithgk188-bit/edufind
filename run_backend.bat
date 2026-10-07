@echo off
title EduFind Backend Server
echo ========================================================
echo   Starting EduFind Backend API Server (FastAPI)
echo ========================================================
echo.

set PATH=C:\nodejs\node-v20.18.0-win-x64;C:\Users\DELL\AppData\Local\Programs\Python\Python312;C:\Users\DELL\AppData\Local\Programs\Python\Python312\Scripts;%PATH%

cd /d "c:\eduFind\backend"
echo Starting FastAPI on http://127.0.0.1:8000 ...
echo Interactive API Documentation: http://127.0.0.1:8000/docs
echo.
python run.py
pause
