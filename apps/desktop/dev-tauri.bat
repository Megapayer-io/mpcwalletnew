@echo off
echo Starting Tauri development server...

REM Install dependencies if needed
if not exist node_modules (
    echo Installing Node.js dependencies...
    npm install
)

REM Install Tauri CLI if not installed
where tauri >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Tauri CLI...
    npm install -g @tauri-apps/cli
)

REM Start Tauri development
echo Starting Tauri dev...
tauri dev

pause
