@echo off
title EduFind Frontend Server
echo ========================================================
echo   Starting EduFind React Frontend (Vite)
echo ========================================================
echo.

set PATH=C:\nodejs\node-v20.18.0-win-x64;C:\Users\DELL\AppData\Local\Programs\Python\Python312;C:\Users\DELL\AppData\Local\Programs\Python\Python312\Scripts;%PATH%

cd /d "c:\eduFind\frontend"
echo Starting Vite Dev Server on http://localhost:3000 ...
echo.
npm run dev
pause
