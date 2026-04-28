/**
 * Biometric Authentication Service
 * Handles fingerprint/FaceID unlock for the wallet
 */

import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { Capacitor } from '@capacitor/core';

const BIOMETRIC_STORAGE_KEY = 'biometric_unlock_token';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export interface BiometricResult {
  success: boolean;
  error?: string;
  token?: string;
}

/**
 * Get biometric type (fingerprint, face, etc.)
 */
export async function getBiometricType(): Promise<string> {
  if (!Capacitor.isNativePlatform()) {
    return 'none';
  }

  try {
    const result = await NativeBiometric.isAvailable();
    if (!result.isAvailable) {
      return 'none';
    }
    
    // Check platform
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') {
      if (result.biometryType === BiometryType.FACE_ID) {
        return 'Face ID';
      } else if (result.biometryType === BiometryType.TOUCH_ID) {
        return 'Touch ID';
      }
      return 'Biometric';
    } else if (platform === 'android') {
      // Check if it's fingerprint or face
      if (result.biometryType === BiometryType.FACE_AUTHENTICATION) {
        return 'Face Unlock';
      } else if (result.biometryType === BiometryType.FINGERPRINT) {
        return 'Fingerprint';
      }
      return 'Fingerprint'; // Default for Android
    }
    
    return 'Biometric';
  } catch (error) {
    console.error('Biometric type check failed:', error);
    return 'none';
  }
}

/**
 * Check if biometric authentication is available on the device
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch (error) {
    console.error('Biometric availability check failed:', error);
    return false;
  }
}

/**
 * Check if biometric unlock is enabled for the user
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await SecureStoragePlugin.get({ key: BIOMETRIC_ENABLED_KEY });
    return enabled.value === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Enable biometric authentication and store encrypted unlock token
 */
export async function enableBiometric(token: string): Promise<BiometricResult> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return {
        success: false,
        error: 'Biometric authentication is only available on native platforms'
      };
    }

    // Check availability
    const available = await isBiometricAvailable();
    if (!available) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device'
      };
    }

    // Verify identity before storing
    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Enable biometric unlock for your wallet',
        title: 'Enable Biometric Unlock',
        subtitle: 'Use your fingerprint or face to unlock Megapayer',
        description: 'This will allow you to quickly unlock your wallet using biometric authentication',
        negativeButtonText: 'Cancel'
      });
    } catch (error) {
      return {
        success: false,
        error: 'Biometric verification failed or was cancelled'
      };
    }

    // Store encrypted token
    await SecureStoragePlugin.set({
      key: BIOMETRIC_STORAGE_KEY,
      value: token
    });

    // Mark biometric as enabled
    await SecureStoragePlugin.set({
      key: BIOMETRIC_ENABLED_KEY,
      value: 'true'
    });

    return {
      success: true,
      token
    };
  } catch (error: any) {
    console.error('Enable biometric failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to enable biometric authentication'
    };
  }
}

/**
 * Disable biometric authentication
 */
export async function disableBiometric(): Promise<BiometricResult> {
  try {
    await SecureStoragePlugin.remove({ key: BIOMETRIC_STORAGE_KEY });
    await SecureStoragePlugin.remove({ key: BIOMETRIC_ENABLED_KEY });
    return { success: true };
  } catch (error: any) {
    console.error('Disable biometric failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to disable biometric authentication'
    };
  }
}

/**
 * Unlock wallet using biometric authentication
 */
export async function unlockWithBiometric(): Promise<BiometricResult> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return {
        success: false,
        error: 'Biometric authentication is only available on native platforms'
      };
    }

    // Check if enabled
    const enabled = await isBiometricEnabled();
    if (!enabled) {
      return {
        success: false,
        error: 'Biometric unlock is not enabled'
      };
    }

    // Prompt biometric
    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Unlock your wallet',
        title: 'Unlock Megapayer',
        subtitle: 'Verify your identity',
        description: 'Use your fingerprint or face to unlock',
        negativeButtonText: 'Cancel',
        useFallback: false
      });
    } catch (error: any) {
      // Handle specific error cases
      if (error.message?.includes('UserCancel') || error.message?.includes('UserFallback')) {
        return {
          success: false,
          error: 'Authentication cancelled'
        };
      }
      
      return {
        success: false,
        error: 'Biometric verification failed or was cancelled'
      };
    }

    // Retrieve stored token
    const stored = await SecureStoragePlugin.get({ key: BIOMETRIC_STORAGE_KEY });
    
    return {
      success: true,
      token: stored.value
    };
  } catch (error: any) {
    console.error('Biometric unlock failed:', error);
    
    // Handle specific error cases
    if (error.message?.includes('UserCancel') || error.message?.includes('UserFallback')) {
      return {
        success: false,
        error: 'Authentication cancelled'
      };
    }

    return {
      success: false,
      error: error.message || 'Biometric authentication failed'
    };
  }
}

