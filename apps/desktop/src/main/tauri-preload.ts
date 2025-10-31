import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Tauri API wrapper to maintain compatibility with existing Electron API
export const tauriAPI = {
  // App info
  getAppVersion: () => invoke<string>('get_app_version'),
  
  // File dialogs
  showSaveDialog: (options: any) => invoke('show_save_dialog', { options }),
  showOpenDialog: (options: any) => invoke('show_open_dialog', { options }),
  showMessageBox: (options: any) => invoke('show_message_box', { options }),
  
  // Menu events
  onMenuNewWallet: (callback: () => void) => {
    listen('menu-new-wallet', callback);
  },
  onMenuImportWallet: (callback: () => void) => {
    listen('menu-import-wallet', callback);
  },
  onMenuAbout: (callback: () => void) => {
    listen('menu-about', callback);
  },
  onMenuLearnMore: (callback: () => void) => {
    listen('menu-learn-more', callback);
  },
  
  // Remove listeners (Tauri handles this automatically)
  removeAllListeners: (channel: string) => {
    // Tauri automatically manages listeners
    console.log(`Tauri: removeAllListeners called for ${channel}`);
  },
};

// Expose the API to the global window object for compatibility
if (typeof window !== 'undefined') {
  (window as any).electronAPI = tauriAPI;
}

// Type definitions are in src/types/electron.d.ts
