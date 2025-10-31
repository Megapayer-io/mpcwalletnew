// Type definitions for Tauri API (compatible with Electron API)
// This ensures TypeScript recognizes the electronAPI during builds

/// <reference path="../main/tauri-preload.ts" />

declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      showSaveDialog: (options: any) => Promise<any>;
      showOpenDialog: (options: any) => Promise<any>;
      showMessageBox: (options: any) => Promise<any>;
      onMenuNewWallet: (callback: () => void) => void;
      onMenuImportWallet: (callback: () => void) => void;
      onMenuAbout: (callback: () => void) => void;
      onMenuLearnMore: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
    } | undefined;
  }
}

export {};

