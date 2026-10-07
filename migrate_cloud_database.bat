@echo off
title EduFind Cloud MySQL Initializer
echo ========================================================
echo   EduFind - Initialize Cloud MySQL Database (Step 2)
echo ========================================================
echo.

set PATH=C:\nodejs\node-v20.18.0-win-x64;C:\Users\DELL\AppData\Local\Programs\Python\Python312;C:\Users\DELL\AppData\Local\Programs\Python\Python312\Scripts;%PATH%

cd /d "c:\eduFind\backend"
python migrate_to_cloud.py

pause
