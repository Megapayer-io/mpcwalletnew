/**
 * QR/Barcode Scanner Service
 * Native camera scanner for wallet addresses and payment URIs
 */

import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export interface ScanResult {
  success: boolean;
  text?: string;
  format?: string;
  error?: string;
}

/**
 * Check if camera permission is granted
 */
export async function checkCameraPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const status = await BarcodeScanner.checkPermission({ force: false });
    return status.granted ?? false;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

/**
 * Request camera permission
 */
export async function requestCameraPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const status = await BarcodeScanner.checkPermission({ force: true });
    
      // Handle different permission states
      if (status.granted) {
        return true;
      } else if (status.denied) {
        // Permission denied permanently - user needs to enable in settings
        alert('Camera permission is required to scan QR codes. Please enable it in your device settings.');
        // Try to open app settings if available
        try {
          if (BarcodeScanner.openAppSettings) {
            await BarcodeScanner.openAppSettings();
          }
        } catch (e) {
          // Ignore if method doesn't exist
          console.log('openAppSettings not available');
        }
        return false;
      } else {
        // Permission not granted yet
        return false;
      }
  } catch (error) {
    console.error('Permission request failed:', error);
    return false;
  }
}

/**
 * Parse wallet address from scanned text (handles ethereum: URIs and plain addresses)
 */
export function parseWalletAddress(text: string): string | null {
  // Ethereum URI format: ethereum:0x...?value=...
  const uriMatch = text.match(/^ethereum:(0x[a-fA-F0-9]{40})/i);
  if (uriMatch) {
    return uriMatch[1];
  }

  // Plain address: 0x...
  const addressMatch = text.match(/^(0x[a-fA-F0-9]{40})$/i);
  if (addressMatch) {
    return addressMatch[1];
  }

  // EIP-681 format: ethereum:0x...@1/value?...
  const eip681Match = text.match(/^ethereum:(0x[a-fA-F0-9]{40})@/i);
  if (eip681Match) {
    return eip681Match[1];
  }

  return null;
}

/**
 * Parse payment request from scanned text
 */
export function parsePaymentRequest(text: string): {
  address: string;
  amount?: string;
  tokenSymbol?: string;
} | null {
  // Ethereum URI with value
  const uriMatch = text.match(/^ethereum:(0x[a-fA-F0-9]{40})\?value=(\d+)/i);
  if (uriMatch) {
    const address = uriMatch[1];
    const valueInWei = uriMatch[2];
    // Convert wei to ether (18 decimals)
    const amount = (parseInt(valueInWei) / Math.pow(10, 18)).toString();
    return { address, amount };
  }

  // Plain address
  const address = parseWalletAddress(text);
  if (address) {
    return { address };
  }

  return null;
}

/**
 * Start QR/Barcode scanner
 */
export async function startScanner(): Promise<ScanResult> {
  if (!Capacitor.isNativePlatform()) {
    return {
      success: false,
      error: 'QR scanner is only available on native platforms'
    };
  }

  try {
    // Check and request camera permission
    const permissionStatus = await BarcodeScanner.checkPermission({ force: false });
    
    if (!permissionStatus.granted) {
      if (permissionStatus.denied) {
        alert('Camera permission is required. Please enable it in your device settings.');
        try {
          if (BarcodeScanner.openAppSettings) {
            await BarcodeScanner.openAppSettings();
          }
        } catch (e) {
          // Ignore
        }
        return {
          success: false,
          error: 'Camera permission is required. Please enable it in app settings.'
        };
      }
      
      // Request permission
      const requestStatus = await BarcodeScanner.checkPermission({ force: true });
      
      if (!requestStatus.granted) {
        return {
          success: false,
          error: 'Camera permission was denied. Please enable it in app settings.'
        };
      }
    }

    // Prepare scanner with explicit configuration
    await BarcodeScanner.prepare();
    
    // Make StatusBar transparent/overlay during scanning
    // Handle each StatusBar call individually to prevent one failure from blocking others
    if (Capacitor.isNativePlatform() && StatusBar) {
      try {
        if (typeof StatusBar.setOverlaysWebView === 'function') {
          await StatusBar.setOverlaysWebView({ overlay: true });
        }
      } catch (e) {
        // Ignore - method might not be available
      }
      
      try {
        if (typeof StatusBar.setStyle === 'function') {
          await StatusBar.setStyle({ style: Style.Light });
        }
      } catch (e) {
        // Ignore - method might not be available
      }
      
      try {
        if (typeof StatusBar.setBackgroundColor === 'function') {
          await StatusBar.setBackgroundColor({ color: '#00000000' }); // Transparent
        }
      } catch (e) {
        // Ignore - method might not be available
      }
    }
    
    // CRITICAL: Hide webview background FIRST - this makes the native camera view visible
    // This must be called before making elements transparent
    await BarcodeScanner.hideBackground();
    
    // Small delay to ensure webview background is hidden
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // CRITICAL: Make ALL app elements transparent so camera preview shows through
    // This is required for the camera view to be visible
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      const body = document.body;
      
      // Remove background gradients and set to transparent
      html.style.background = 'transparent';
      html.style.backgroundColor = 'transparent';
      body.style.background = 'transparent';
      body.style.backgroundColor = 'transparent';
      
      // Make all main containers transparent
      const appContainer = document.getElementById('__next') || document.body;
      if (appContainer) {
        appContainer.style.background = 'transparent';
        appContainer.style.backgroundColor = 'transparent';
      }
      
      // Make all direct children of body transparent
      Array.from(body.children).forEach((child: any) => {
        if (child && child.style) {
          child.style.background = 'transparent';
          child.style.backgroundColor = 'transparent';
        }
      });
      
      // Hide all elements that might block the camera view
      // We'll add a class to identify scanner-active state
      body.classList.add('scanner-active');
    }
    
    // Start scanning - the native camera view should now be visible
    const result = await BarcodeScanner.startScan();

    // Cleanup: Restore background and stop scanner
    try {
      // Restore app background
      if (typeof document !== 'undefined') {
        const html = document.documentElement;
        const body = document.body;
        
        // Remove scanner-active class
        body.classList.remove('scanner-active');
        
        // Restore backgrounds
        html.style.background = '';
        html.style.backgroundColor = '';
        body.style.background = '';
        body.style.backgroundColor = '';
        
        const appContainer = document.getElementById('__next') || document.body;
        if (appContainer) {
          appContainer.style.background = '';
          appContainer.style.backgroundColor = '';
        }
        
        // Restore children backgrounds
        Array.from(body.children).forEach((child: any) => {
          if (child && child.style) {
            child.style.background = '';
            child.style.backgroundColor = '';
          }
        });
      }
      
      // Restore StatusBar - handle each call individually
      if (Capacitor.isNativePlatform() && StatusBar) {
        try {
          if (typeof StatusBar.setOverlaysWebView === 'function') {
            await StatusBar.setOverlaysWebView({ overlay: false });
          }
        } catch (e) {
          // Ignore
        }
        
        try {
          if (typeof StatusBar.setStyle === 'function') {
            await StatusBar.setStyle({ style: Style.Dark });
          }
        } catch (e) {
          // Ignore
        }
        
        try {
          if (typeof StatusBar.setBackgroundColor === 'function') {
            await StatusBar.setBackgroundColor({ color: '#ffffff' });
          }
        } catch (e) {
          // Ignore
        }
      }
      
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    // Check if we got a result
    if (result && result.hasContent && result.content) {
      return {
        success: true,
        text: result.content,
        format: result.format
      };
    }

    return {
      success: false,
      error: 'No QR code detected. Please try again.'
    };
  } catch (error: any) {
    // Always cleanup on error - restore the webview and background
    try {
      // Restore app background
      if (typeof document !== 'undefined') {
        const html = document.documentElement;
        const body = document.body;
        
        // Remove scanner-active class
        body.classList.remove('scanner-active');
        
        // Restore backgrounds
        html.style.background = '';
        html.style.backgroundColor = '';
        body.style.background = '';
        body.style.backgroundColor = '';
        
        const appContainer = document.getElementById('__next') || document.body;
        if (appContainer) {
          appContainer.style.background = '';
          appContainer.style.backgroundColor = '';
        }
        
        // Restore children backgrounds
        Array.from(body.children).forEach((child: any) => {
          if (child && child.style) {
            child.style.background = '';
            child.style.backgroundColor = '';
          }
        });
      }
      
      // Restore StatusBar - handle each call individually
      if (Capacitor.isNativePlatform() && StatusBar) {
        try {
          if (typeof StatusBar.setOverlaysWebView === 'function') {
            await StatusBar.setOverlaysWebView({ overlay: false });
          }
        } catch (e) {
          // Ignore
        }
        
        try {
          if (typeof StatusBar.setStyle === 'function') {
            await StatusBar.setStyle({ style: Style.Dark });
          }
        } catch (e) {
          // Ignore
        }
        
        try {
          if (typeof StatusBar.setBackgroundColor === 'function') {
            await StatusBar.setBackgroundColor({ color: '#ffffff' });
          }
        } catch (e) {
          // Ignore
        }
      }
      
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    // Handle user cancellation
    const errorMessage = error?.message || error?.toString() || '';
    if (
      errorMessage.includes('UserCancel') || 
      errorMessage.includes('cancel') ||
      errorMessage.includes('User cancelled') ||
      errorMessage.includes('cancelled') ||
      errorMessage.toLowerCase().includes('user cancel')
    ) {
      return {
        success: false,
        error: 'Scan cancelled'
      };
    }

    console.error('QR scan failed:', error);
    return {
      success: false,
      error: errorMessage || 'Failed to scan QR code. Please try again.'
    };
  }
}

/**
 * Stop scanner (cleanup)
 */
export async function stopScanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await BarcodeScanner.showBackground();
    await BarcodeScanner.stopScan();
  } catch (error) {
    console.error('Stop scanner failed:', error);
  }
}

