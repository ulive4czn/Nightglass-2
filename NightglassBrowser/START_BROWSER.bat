@echo off
setlocal
title Nightglass Browser
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js LTS from https://nodejs.org/ first.
  pause
  exit /b 1
)
if not exist "node_modules\electron\dist\electron.exe" (
  echo First run setup using RUN_ME_FIRST.bat.
  pause
  exit /b 1
)
call npm start
endlocal
