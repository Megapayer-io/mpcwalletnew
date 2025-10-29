import { app } from 'electron';

export const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

export const getAppPath = (): string => {
  return isDev ? process.cwd() : app.getAppPath();
};

export const getUserDataPath = (): string => {
  return app.getPath('userData');
};

export const getLogsPath = (): string => {
  return app.getPath('logs');
};
