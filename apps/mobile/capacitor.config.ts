import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.megapayer.wallet',
  appName: 'Ettios',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: 'keystore/megapayer-release.keystore',
      keystoreAlias: 'megapayer'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff'
    },
    BarcodeScanner: {
      // Configure barcode scanner plugin
      // This ensures the camera preview is properly displayed
    }
  }
};

export default config;

