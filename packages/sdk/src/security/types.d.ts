/**
 * Type declarations for cross-platform dependencies
 */

// Chrome Extension API
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        id?: string;
      };
      storage?: {
        local?: {
          set: (items: Record<string, any>) => Promise<void>;
          get: (keys: string[]) => Promise<Record<string, any>>;
        };
      };
    };
  }
}

// Capacitor types
declare module '@capacitor-community/biometric-auth' {
  export const BiometricAuth: {
    checkBiometry(): Promise<{ isAvailable: boolean }>;
    authenticate(options: {
      reason: string;
      fallbackTitle: string;
      allowDeviceCredential: boolean;
    }): Promise<{ authenticated: boolean }>;
  };
}

// Tauri types
declare module '@tauri-apps/api/tauri' {
  export function invoke(command: string, args?: any): Promise<any>;
}

// React Native WebView types
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    Capacitor?: any;
    electronAPI?: {
      isBiometricSupported(): Promise<boolean>;
      authenticateBiometric(type: string): Promise<boolean>;
      setSecureStorage(key: string, value: string): Promise<void>;
      getSecureStorage(key: string): Promise<string | null>;
    };
    __TAURI__?: any;
    __mpcWalletSecureStorage?: Record<string, string>;
  }
}

export {};
