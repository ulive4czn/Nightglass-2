@echo off
setlocal
title Nightglass Browser Setup
cd /d "%~dp0"
echo.
echo  NIGHTGLASS BROWSER - ONE-TIME SETUP
echo  -----------------------------------
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found.
  echo Opening the official Node.js download page...
  start "" "https://nodejs.org/"
  echo.
  echo Install the LTS version, then close this window and run RUN_ME_FIRST.bat again.
  pause
  exit /b 1
)
echo Installing browser components. This may take a few minutes the first time.
call npm install
if errorlevel 1 (
  echo.
  echo Setup failed. Check the error above and your internet connection.
  pause
  exit /b 1
)
echo.
echo Setup finished. Starting Nightglass Browser...
call npm start
if errorlevel 1 (
  echo.
  echo Browser closed with an error. Check the message above.
  pause
)
endlocal
