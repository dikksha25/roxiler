@echo off
setlocal
set "PATH=C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\nodejs;%APPDATA%\npm;%PATH%"
echo ============================================================
echo [Store Rating Platform] Running Automated Backend Tests...
echo ============================================================
call npm.cmd test
echo ============================================================
pause
