/**
 * QR/Barcode Scanner Service
 * Native camera scanner for wallet addresses and payment URIs
 */

import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';

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
    return status.granted ?? false;
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
    // Check/request permission
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      const granted = await requestCameraPermission();
      if (!granted) {
        return {
          success: false,
          error: 'Camera permission is required to scan QR codes'
        };
      }
    }

    // Hide background content
    await BarcodeScanner.hideBackground();
    
    // Prepare scanner
    await BarcodeScanner.prepare();

    // Start scanning
    const result = await BarcodeScanner.startScan();

    // Show background again
    await BarcodeScanner.showBackground();
    await BarcodeScanner.stopScan();

    if (result.hasContent) {
      return {
        success: true,
        text: result.content,
        format: result.format
      };
    }

    return {
      success: false,
      error: 'No QR code detected'
    };
  } catch (error: any) {
    // Show background on error
    try {
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
    } catch (e) {
      // Ignore cleanup errors
    }

    if (error.message?.includes('UserCancel') || error.message?.includes('cancel')) {
      return {
        success: false,
        error: 'Scan cancelled'
      };
    }

    console.error('QR scan failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to scan QR code'
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

