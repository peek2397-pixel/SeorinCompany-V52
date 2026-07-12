@echo off
chcp 65001 > nul
python "%~dp0backup_agent.py"
pause
