@echo off
setlocal
title SeorinCompany Windows Setup Builder

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install Node.js LTS first, then run this file again.
  pause
  exit /b 1
)

call npm install
if errorlevel 1 (
  echo npm install failed.
  pause
  exit /b 1
)

call npm run build:win
if errorlevel 1 (
  echo Windows installer build failed.
  pause
  exit /b 1
)

echo.
echo Build completed.
echo Open the dist folder to find SeorinCompany_Setup_1.0.0.exe
echo.
start "" "%~dp0dist"
pause
endlocal
