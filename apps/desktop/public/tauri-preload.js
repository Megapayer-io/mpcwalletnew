// Tauri preload script - compiled version
// This will be replaced by the actual Tauri API when running in Tauri

// Mock API for development/testing
if (typeof window !== 'undefined' && !window.electronAPI) {
  window.electronAPI = {
    getAppVersion: () => Promise.resolve('1.0.0'),
    showSaveDialog: (options) => Promise.resolve({ canceled: true, filePath: '' }),
    showOpenDialog: (options) => Promise.resolve({ canceled: true, filePaths: [] }),
    showMessageBox: (options) => Promise.resolve({ response: 0 }),
    onMenuNewWallet: (callback) => console.log('Menu new wallet listener registered'),
    onMenuImportWallet: (callback) => console.log('Menu import wallet listener registered'),
    onMenuAbout: (callback) => console.log('Menu about listener registered'),
    onMenuLearnMore: (callback) => console.log('Menu learn more listener registered'),
    removeAllListeners: (channel) => console.log(`Remove listeners for ${channel}`)
  };
}
