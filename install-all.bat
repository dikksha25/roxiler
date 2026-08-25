@echo off
setlocal
set "PATH=C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\nodejs;%APPDATA%\npm;%PATH%"
echo ============================================================
echo [Store Rating Platform] Installing All Dependencies...
echo ============================================================
call npm.cmd install
call npm.cmd --prefix backend install
call npm.cmd --prefix frontend install
echo ============================================================
echo [Store Rating Platform] Dependencies Installed Successfully!
echo ============================================================
pause
