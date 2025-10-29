import { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { isDev } from './utils'

class DesktopApp {
  private mainWindow: BrowserWindow | null = null
  private tray: Tray | null = null
  private isQuitting = false

  constructor() {
    this.initializeApp()
  }

  private initializeApp() {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow()
      this.createTray()
      this.createMenu()
      this.setupIPC()
    })

    // Handle window closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    // Handle app activate (macOS)
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow()
      }
    })

    // Handle before quit
    app.on('before-quit', () => {
      this.isQuitting = true
    })
  }

  private async loadDevURL() {
    const maxRetries = 10
    const retryDelay = 1000
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.mainWindow?.loadURL('http://localhost:3008/')
        console.log('Successfully loaded development URL')
        return
      } catch (error) {
        console.log(`Attempt ${i + 1} failed to load URL, retrying in ${retryDelay}ms...`)
        if (i === maxRetries - 1) {
          console.error('Failed to load development URL after all retries')
          // Load a fallback page
          this.mainWindow?.loadURL('data:text/html,<html><body><h1>Development server not ready</h1><p>Please ensure Vite is running on port 3007</p></body></html>')
        } else {
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
    }
  }

  private createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 1000,
      minHeight: 700,
      show: false,
      frame: false, // Custom title bar
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#ffffff',
        symbolColor: '#333333',
        height: 40
      },
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false
      },
      icon: join(__dirname, '../assets/icon.png'),
      backgroundColor: '#f8fafc'
    })

    // Load the app
    if (isDev) {
      // Wait for Vite to start, then load the URL with retry logic
      this.loadDevURL()
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()
      
      // Focus on the window
      if (isDev) {
        this.mainWindow?.webContents.openDevTools()
      }
    })

    // Handle window closed
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting) {
        event.preventDefault()
        this.mainWindow?.hide()
      }
    })

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: 'deny' }
    })
  }

  private createTray() {
    const iconPath = join(__dirname, '../assets/tray-icon.png')
    const icon = nativeImage.createFromPath(iconPath)
    
    this.tray = new Tray(icon)
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show MPC Wallet',
        click: () => {
          this.mainWindow?.show()
          this.mainWindow?.focus()
        }
      },
      {
        label: 'Dashboard',
        click: () => {
          this.mainWindow?.show()
          this.mainWindow?.focus()
          this.mainWindow?.webContents.send('navigate-to', '/')
        }
      },
      {
        label: 'Send',
        click: () => {
          this.mainWindow?.show()
          this.mainWindow?.focus()
          this.mainWindow?.webContents.send('navigate-to', '/send')
        }
      },
      {
        label: 'Receive',
        click: () => {
          this.mainWindow?.show()
          this.mainWindow?.focus()
          this.mainWindow?.webContents.send('navigate-to', '/receive')
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          this.isQuitting = true
          app.quit()
        }
      }
    ])

    this.tray.setContextMenu(contextMenu)
    this.tray.setToolTip('MPC Wallet - Professional Web3 Desktop Wallet')
    
    // Double click to show window
    this.tray.on('double-click', () => {
      this.mainWindow?.show()
      this.mainWindow?.focus()
    })
  }

  private createMenu() {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Wallet',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('menu-action', 'new-wallet')
            }
          },
          {
            label: 'Import Wallet',
            accelerator: 'CmdOrCtrl+I',
            click: () => {
              this.mainWindow?.webContents.send('menu-action', 'import-wallet')
            }
          },
          { type: 'separator' },
          {
            label: 'Export Wallet',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              this.mainWindow?.webContents.send('menu-action', 'export-wallet')
            }
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              this.isQuitting = true
              app.quit()
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Wallet',
        submenu: [
          {
            label: 'Dashboard',
            accelerator: 'CmdOrCtrl+1',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/')
            }
          },
          {
            label: 'Send',
            accelerator: 'CmdOrCtrl+2',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/send')
            }
          },
          {
            label: 'Receive',
            accelerator: 'CmdOrCtrl+3',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/receive')
            }
          },
          {
            label: 'History',
            accelerator: 'CmdOrCtrl+4',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/history')
            }
          },
          { type: 'separator' },
          {
            label: 'Account Management',
            accelerator: 'CmdOrCtrl+A',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/account')
            }
          },
          {
            label: 'Settings',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              this.mainWindow?.webContents.send('navigate-to', '/settings')
            }
          }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About MPC Wallet',
            click: () => {
              this.mainWindow?.webContents.send('menu-action', 'about')
            }
          },
          {
            label: 'Documentation',
            click: () => {
              shell.openExternal('https://docs.mpcwallet.com')
            }
          },
          {
            label: 'Support',
            click: () => {
              shell.openExternal('https://support.mpcwallet.com')
            }
          }
        ]
      }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  private setupIPC() {
    // Handle file operations
    ipcMain.handle('show-open-dialog', async (_event, options) => {
      const result = await dialog.showOpenDialog(this.mainWindow!, options)
      return result
    })

    ipcMain.handle('show-save-dialog', async (_event, options) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, options)
      return result
    })

    // Handle notifications
    ipcMain.handle('show-notification', async (_event, options) => {
      if (process.platform === 'win32') {
        // Windows notification
        const { Notification } = require('electron')
        new Notification(options.title, {
          body: options.body,
          icon: join(__dirname, '../assets/icon.png')
        })
      }
      return true
    })

    // Handle window controls
    ipcMain.handle('window-minimize', () => {
      this.mainWindow?.minimize()
    })

    ipcMain.handle('window-maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize()
      } else {
        this.mainWindow?.maximize()
      }
    })

    ipcMain.handle('window-close', () => {
      this.mainWindow?.close()
    })

    // Handle app info
    ipcMain.handle('get-app-version', () => {
      return app.getVersion()
    })
  }
}

// Initialize the app
new DesktopApp()
