import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // File dialogs
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  showMessageBox: (options: any) => ipcRenderer.invoke('show-message-box', options),
  
  // Menu events
  onMenuNewWallet: (callback: () => void) => {
    ipcRenderer.on('menu-new-wallet', callback);
  },
  onMenuImportWallet: (callback: () => void) => {
    ipcRenderer.on('menu-import-wallet', callback);
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      showSaveDialog: (options: any) => Promise<any>;
      showOpenDialog: (options: any) => Promise<any>;
      showMessageBox: (options: any) => Promise<any>;
      onMenuNewWallet: (callback: () => void) => void;
      onMenuImportWallet: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
