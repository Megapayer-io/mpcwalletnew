import { app } from 'electron'
import { join } from 'path'

export const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

export const getAssetPath = (path: string): string => {
  const RESOURCES_PATH = app.isPackaged
    ? join(process.resourcesPath, 'assets')
    : join(__dirname, '../assets')

  return join(RESOURCES_PATH, path)
}

export const getAppDataPath = (): string => {
  return app.getPath('userData')
}

export const getWalletDataPath = (): string => {
  return join(getAppDataPath(), 'wallet-data')
}
