@echo off
REM =====================================
REM CredLens - Backend & Frontend Launcher
REM =====================================

echo.
echo ===============================================
echo    CredLens - Credit Risk Assessment Platform
echo ===============================================
echo.

set PROJECT_DIR=%~dp0

echo [1/2] Starting FastAPI backend on port 5000...
echo.
start "CredLens Backend" cmd /k "cd /d %PROJECT_DIR% && python src/api.py"

timeout /t 3 /nobreak

echo [2/2] Starting React frontend on port 3000...
echo.
start "CredLens Frontend" cmd /k "cd /d %PROJECT_DIR%\\frontend && npm start"

echo.
echo ===============================================
echo    Both servers are starting
echo ===============================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://127.0.0.1:5000
echo Docs:     http://127.0.0.1:5000/docs
echo.
echo Press any key to exit this launcher...
pause >nul
