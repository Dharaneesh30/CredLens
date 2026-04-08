@echo off
REM =====================================
REM CredLens - Backend & Frontend Launcher
REM =====================================

echo.
echo ===============================================
echo    CredLens - Credit Risk Assessment Platform
echo ===============================================
echo.

REM Get the project root directory
set PROJECT_DIR=%~dp0

echo [1/2] Starting Flask API Server on port 5000...
echo.

REM Start the Flask API in a new terminal window
start "CredLens API Server" cmd /k "cd /d %PROJECT_DIR% && python api.py"

REM Wait a bit for the API to start
timeout /t 3 /nobreak

echo [2/2] Starting React Frontend on port 3000...
echo.

REM Start the React frontend in a new terminal window
start "CredLens Frontend" cmd /k "cd /d %PROJECT_DIR%\frontend && npm start"

echo.
echo ===============================================
echo    ✅ Both servers are starting!
echo ===============================================
echo.
echo 🔗 Frontend:  http://localhost:3000
echo 🔗 API:       http://127.0.0.1:5000
echo 📊 Docs:      http://127.0.0.1:5000 (API docs)
echo.
echo Press any key to exit this launcher...
pause >nul
