@echo off
echo Building Tauri application...

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

REM Build the Next.js frontend
echo Building Next.js frontend...
npm run build:renderer

REM Build the Tauri application
echo Building Tauri application...
tauri build

echo Build complete!
pause
