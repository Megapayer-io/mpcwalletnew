# Tauri Migration Guide

This document outlines the migration from Electron to Tauri for the Megapayer Desktop application.

## What Changed

### 1. Backend (Rust)
- **Before**: Electron main process (`src/main/main.ts`)
- **After**: Tauri Rust backend (`src-tauri/src/main.rs`)

### 2. Frontend Integration
- **Before**: Electron preload script (`src/main/preload.ts`)
- **After**: Tauri API integration (`src/main/tauri-preload.ts`)

### 3. Build System
- **Before**: Electron Builder
- **After**: Tauri CLI

### 4. Package Configuration
- Removed Electron dependencies
- Added Tauri dependencies (`@tauri-apps/api`, `@tauri-apps/cli`)

## Key Features Migrated

### IPC Communication
- `get-app-version` → `get_app_version`
- `show-save-dialog` → `show_save_dialog`
- `show-open-dialog` → `show_open_dialog`
- `show-message-box` → `show_message_box`

### Menu System
- File menu (New Wallet, Import Wallet, Quit)
- Edit menu (Cut, Copy, Paste, etc.)
- View menu (Reload, DevTools, Zoom, etc.)
- Window menu (Minimize, Close)
- Help menu (About, Learn More)

### System Tray
- Tray icon with context menu
- Show/Hide/Quit functionality

## Development

### Prerequisites
1. Install Rust: https://rustup.rs/
2. Install Node.js dependencies: `npm install`
3. Install Tauri CLI: `npm install -g @tauri-apps/cli`

### Running Development
```bash
npm run dev
# or
tauri dev
```

### Building
```bash
npm run build
# or
tauri build
```

### Windows Scripts
- `dev-tauri.bat` - Start development server
- `build-tauri.bat` - Build production app

## Configuration Files

- `src-tauri/tauri.conf.json` - Tauri configuration
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/src/main.rs` - Main Rust application

## Benefits of Tauri

1. **Smaller Bundle Size**: ~10MB vs ~100MB+ for Electron
2. **Better Performance**: Native Rust backend
3. **Better Security**: Smaller attack surface
4. **Memory Efficiency**: Lower memory usage
5. **Cross-platform**: Same codebase for all platforms

## Troubleshooting

### Rust Not Found
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Restart terminal
```

### Build Errors
1. Make sure all dependencies are installed
2. Check Rust installation
3. Verify Tauri CLI is installed globally

### Development Issues
1. Ensure Next.js dev server is running on port 3001
2. Check Tauri configuration in `tauri.conf.json`
3. Verify all API calls are properly imported
