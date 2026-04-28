'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { CustomIcons } from './icons/CustomIcons';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (text: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen && Capacitor.isNativePlatform()) {
      // Make entire app transparent when modal opens
      makeAppTransparent();
      startScanning();
    } else if (!isOpen) {
      stopScanning();
      restoreAppBackground();
    }

    return () => {
      if (!isOpen) {
        stopScanning();
        restoreAppBackground();
      }
    };
  }, [isOpen]);

  const makeAppTransparent = () => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      const body = document.body;
      
      // Make everything transparent
      html.style.background = 'transparent';
      html.style.backgroundColor = 'transparent';
      body.style.background = 'transparent';
      body.style.backgroundColor = 'transparent';
      
      // Hide main app container
      const appContainer = document.getElementById('__next') || document.body;
      if (appContainer) {
        appContainer.style.background = 'transparent';
        appContainer.style.backgroundColor = 'transparent';
        appContainer.style.opacity = '0';
      }
      
      // Make all children transparent
      Array.from(body.children).forEach((child: any) => {
        if (child && child.style && child.id !== 'scanner-modal-root') {
          child.style.background = 'transparent';
          child.style.backgroundColor = 'transparent';
          child.style.opacity = '0';
        }
      });
      
      body.classList.add('scanner-active');
    }
  };

  const restoreAppBackground = () => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      const body = document.body;
      
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
        appContainer.style.opacity = '';
      }
      
      // Restore children
      Array.from(body.children).forEach((child: any) => {
        if (child && child.style && child.id !== 'scanner-modal-root') {
          child.style.background = '';
          child.style.backgroundColor = '';
          child.style.opacity = '';
        }
      });
    }
  };

  const checkPermission = async () => {
    if (!Capacitor.isNativePlatform()) {
      setError('QR scanner is only available on native platforms');
      return false;
    }

    try {
      const status = await BarcodeScanner.checkPermission({ force: false });
      if (status.granted) {
        setHasPermission(true);
        return true;
      }
      
      if (status.denied) {
        setError('Camera permission is required. Please enable it in your device settings.');
        setHasPermission(false);
        return false;
      }

      // Request permission
      const requestStatus = await BarcodeScanner.checkPermission({ force: true });
      if (requestStatus.granted) {
        setHasPermission(true);
        return true;
      }
      
      setError('Camera permission was denied. Please enable it in app settings.');
      setHasPermission(false);
      return false;
    } catch (err: any) {
      setError(err.message || 'Failed to check camera permission');
      return false;
    }
  };

  const startScanning = async () => {
    if (!Capacitor.isNativePlatform()) {
      setError('QR scanner is only available on native platforms');
      return;
    }

    try {
      setError(null);
      setIsScanning(false);

      // Check permission first
      const hasPerm = await checkPermission();
      if (!hasPerm) {
        return;
      }

      // Make StatusBar transparent/overlay during scanning
      if (Capacitor.isNativePlatform() && StatusBar) {
        try {
          if (typeof StatusBar.setOverlaysWebView === 'function') {
            await StatusBar.setOverlaysWebView({ overlay: true });
          }
        } catch (e) {
          // Ignore
        }
        
        try {
          if (typeof StatusBar.setStyle === 'function') {
            await StatusBar.setStyle({ style: Style.Light });
          }
        } catch (e) {
          // Ignore
        }
        
        try {
          if (typeof StatusBar.setBackgroundColor === 'function') {
            await StatusBar.setBackgroundColor({ color: '#00000000' });
          }
        } catch (e) {
          // Ignore
        }
      }

      // Prepare scanner
      await BarcodeScanner.prepare();
      
      // CRITICAL: Hide webview background - this makes native camera visible
      await BarcodeScanner.hideBackground();
      
      // Wait for camera to be ready
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Start scanning
      setIsScanning(true);
      const result = await BarcodeScanner.startScan();

      // Handle result
      if (result && result.hasContent && result.content) {
        onScan(result.content);
        await stopScanning();
        restoreAppBackground();
        onClose();
      } else {
        setError('No QR code detected. Please try again.');
        setIsScanning(false);
      }
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || '';
      
      // Handle user cancellation
      if (
        errorMessage.includes('UserCancel') || 
        errorMessage.includes('cancel') ||
        errorMessage.includes('User cancelled') ||
        errorMessage.includes('cancelled') ||
        errorMessage.toLowerCase().includes('user cancel')
      ) {
        await stopScanning();
        restoreAppBackground();
        onClose();
        return;
      }

      setError(errorMessage || 'Failed to start scanner. Please try again.');
      setIsScanning(false);
      await stopScanning();
    }
  };

  const stopScanning = async () => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Restore StatusBar
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
      setIsScanning(false);
    } catch (err) {
      // Ignore cleanup errors
      console.log('Stop scanner error (ignored):', err);
    }
  };

  const handleOpenSettings = async () => {
    try {
      if (BarcodeScanner.openAppSettings) {
        await BarcodeScanner.openAppSettings();
      }
    } catch (e) {
      // Ignore
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="scanner-modal-root"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex flex-col"
        style={{ 
          backgroundColor: 'transparent',
          pointerEvents: isScanning && !error ? 'none' : 'auto'
        }}
      >
        {/* Beautiful Header - only visible when not scanning or on error */}
        {(!isScanning || error) && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-5 pt-12 pointer-events-auto"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22E1FF] to-[#34D399] flex items-center justify-center shadow-lg">
                <CustomIcons.QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold font-heading">Scan QR Code</h2>
                <p className="text-white/70 text-xs font-body">Position code within frame</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/70 transition-all pointer-events-auto"
            >
              <CustomIcons.X className="w-5 h-5 text-white" />
            </motion.button>
          </motion.div>
        )}

        {/* Camera view area - COMPLETELY TRANSPARENT so camera shows through */}
        <div 
          className="flex-1 relative"
          style={{ 
            backgroundColor: 'transparent',
            pointerEvents: 'none'
          }}
        >
          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6 z-40 bg-black/70 backdrop-blur-sm pointer-events-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 max-w-sm w-full border border-white/10 shadow-2xl"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <CustomIcons.AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                </div>
                <h3 className="text-white text-lg font-bold font-heading text-center mb-2">Error</h3>
                <p className="text-white/80 font-body text-sm text-center mb-6">{error}</p>
                {error.includes('permission') && (
                  <motion.button
                    onClick={handleOpenSettings}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mb-3 px-6 py-3 bg-gradient-to-r from-[#22E1FF] to-[#34D399] text-black rounded-xl font-bold font-heading shadow-lg"
                  >
                    Open Settings
                  </motion.button>
                )}
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold font-heading border border-white/20 transition-all"
                >
                  Close
                </motion.button>
              </motion.div>
            </div>
          )}

          {/* Loading state */}
          {!error && !isScanning && hasPermission === null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30 pointer-events-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 border-4 border-[#22E1FF] border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-lg"></div>
                <p className="text-white font-body text-lg font-semibold">Preparing camera...</p>
                <p className="text-white/60 font-body text-sm mt-2">Please wait</p>
              </motion.div>
            </div>
          )}

          {/* Beautiful scanning frame overlay - ONLY UI ELEMENTS, no blocking */}
          {isScanning && !error && (
            <>
              {/* Overlay with cutout - semi-transparent so camera shows through */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                {/* Top overlay */}
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-black/30"></div>
                {/* Bottom overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/30"></div>
                {/* Left overlay */}
                <div className="absolute top-1/3 left-0 w-1/4 h-1/3 bg-black/30"></div>
                {/* Right overlay */}
                <div className="absolute top-1/3 right-0 w-1/4 h-1/3 bg-black/30"></div>
              </div>

              {/* Scanning frame with animated corners */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  {/* Main frame */}
                  <div className="w-72 h-72 relative">
                    {/* Animated scanning line */}
                    <motion.div
                      animate={{
                        y: [0, 280, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#22E1FF] to-transparent"
                      style={{ boxShadow: '0 0 20px rgba(34, 225, 255, 0.8)' }}
                    />

                    {/* Corner brackets with glow effect */}
                    {/* Top-left */}
                    <div className="absolute -top-2 -left-2 w-12 h-12">
                      <div className="absolute top-0 left-0 w-8 h-1 bg-gradient-to-r from-[#22E1FF] to-[#34D399]" style={{ boxShadow: '0 0 10px rgba(34, 225, 255, 0.8)' }}></div>
                      <div className="absolute top-0 left-0 w-1 h-8 bg-gradient-to-b from-[#22E1FF] to-[#34D399]" style={{ boxShadow: '0 0 10px rgba(34, 225, 255, 0.8)' }}></div>
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#22E1FF] rounded-tl-lg"></div>
                    </div>
                    
                    {/* Top-right */}
                    <div className="absolute -top-2 -right-2 w-12 h-12">
                      <div className="absolute top-0 right-0 w-8 h-1 bg-gradient-to-l from-[#22E1FF] to-[#34D399]" style={{ boxShadow: '0 0 10px rgba(34, 225, 255, 0.8)' }}></div>
                      <div className="absolute top-0 right-0 w-1 h-8 bg-gradient-to-b from-[#22E1FF] to-[#34D399]" style={{ boxShadow: '0 0 10px rgba(34, 225, 255, 0.8)' }}></div>
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#22E1FF] rounded-tr-lg"></div>
                    </div>
                    
                    {/* Bottom-left */}
                    <div className="absolute -bottom-2 -left-2 w-12 h-12">
                      <div className="absolute bottom-0 left-0 w-8 h-1 bg-gradient-to-r from-[#22E1FF] to-[#34D399]" style={{ boxShadow: '0 0 10px rgba(34, 225, 255, 0.8)' }}></div>
                      <div className="absolute bottom-0 left-0 w-1 h-8 bg-gradient-to-t from-[#22E1FF] to-[#34D399]" style={{ boxShadow: '0 0 10px rgba(34, 225, 255, 0.8)' }}></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#22E1FF] rounded-bl-lg"></div>
                    </div>
                    
                    {/* Bottom-right */}
                    <div className="absolute -bottom-2 -right-2 w-12 h-12">
                      <div className="absolute bottom-0 right-0 w-8 h-1 bg-gradient-to-l from-[#22E1FF] to-[#34D399]" style={{ boxShadow: '0 0 10px rgba(34, 225, 255, 0.8)' }}></div>
                      <div className="absolute bottom-0 right-0 w-1 h-8 bg-gradient-to-t from-[#22E1FF] to-[#34D399]" style={{ boxShadow: '0 0 10px rgba(34, 225, 255, 0.8)' }}></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#22E1FF] rounded-br-lg"></div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Header when scanning - minimal */}
              <div className="absolute top-0 left-0 right-0 z-30 pointer-events-auto">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-center justify-between p-5 pt-12"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22E1FF] to-[#34D399] flex items-center justify-center shadow-lg">
                      <CustomIcons.QrCode className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-white text-xl font-bold font-heading">Scan QR Code</h2>
                  </div>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/70 transition-all"
                  >
                    <CustomIcons.X className="w-5 h-5 text-white" />
                  </motion.button>
                </motion.div>
              </div>

              {/* Scanning indicator with pulse effect */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-32 left-0 right-0 flex justify-center z-30 pointer-events-none"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-[#22E1FF] border-t-transparent rounded-full"
                    ></motion.div>
                    <p className="text-white font-body text-sm font-semibold">Scanning...</p>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </div>

        {/* Beautiful bottom instructions */}
        {isScanning && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 z-30 p-6 pb-8 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
            }}
          >
            <div className="text-center">
              <p className="text-white/90 font-body text-sm font-semibold mb-1">
                Position QR code within frame
              </p>
              <p className="text-white/60 font-body text-xs">
                Make sure the code is clear and well-lit
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
