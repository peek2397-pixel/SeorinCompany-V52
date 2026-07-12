@echo off
chcp 65001 > nul
set SCRIPT=%~dp0backup_agent.py
where python >nul 2>nul
if errorlevel 1 (
  echo Python이 설치되어 있지 않습니다. https://www.python.org 에서 설치 후 다시 실행하세요.
  pause
  exit /b 1
)
schtasks /Create /TN "SeorinPortalDailyBackup" /TR "python \"%SCRIPT%\"" /SC DAILY /ST 00:00 /F
echo.
echo 매일 자정 00:00 자동 백업 작업을 등록했습니다.
echo 컴퓨터가 꺼져 있으면 그 시간에는 실행되지 않습니다.
pause
