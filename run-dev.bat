@echo off
setlocal
set "PATH=C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\nodejs;%APPDATA%\npm;%PATH%"
echo ============================================================
echo [Store Rating Platform] Starting Development Servers...
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000/api/v1
echo ============================================================
call npm.cmd run dev
