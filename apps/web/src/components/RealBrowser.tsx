'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWalletStore } from '@/store/wallet';

interface RealBrowserProps {
  url: string;
  onUrlChange: (url: string) => void;
  onLoadStart: () => void;
  onLoadEnd: () => void;
  onError: (error: string) => void;
}

export const RealBrowser: React.FC<RealBrowserProps> = ({
  url,
  onUrlChange,
  onLoadStart,
  onLoadEnd,
  onError
}) => {
  const { address, currentNetwork } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const browserRef = useRef<HTMLDivElement>(null);

  // Inject wallet provider into the page
  const injectWalletProvider = useCallback(() => {
    if (!browserRef.current) return;

    const iframe = browserRef.current.querySelector('iframe');
    if (!iframe) return;

    try {
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) return;

      // Create a MetaMask-like provider
      const ethereum = {
        isMetaMask: true,
        isConnected: () => !!address,
        request: async ({ method, params }: any) => {
          console.log('DApp request:', method, params);
          
          switch (method) {
            case 'eth_requestAccounts':
              return address ? [address] : [];
            case 'eth_accounts':
              return address ? [address] : [];
            case 'eth_chainId':
              return currentNetwork?.chainId ? `0x${currentNetwork.chainId.toString(16)}` : '0x1';
            case 'eth_sendTransaction':
              // Handle transaction sending
              console.log('Transaction request:', params);
              return '0x1234567890abcdef'; // Mock transaction hash
            case 'personal_sign':
              // Handle message signing
              console.log('Sign request:', params);
              return '0xabcdef1234567890'; // Mock signature
            default:
              throw new Error(`Unsupported method: ${method}`);
          }
        },
        on: (event: string, callback: Function) => {
          console.log('DApp event listener:', event);
        },
        removeListener: (event: string, callback: Function) => {
          console.log('DApp remove listener:', event);
        }
      };

      // Inject the provider
      (iframeWindow as any).ethereum = ethereum;
      (iframeWindow as any).web3 = { currentProvider: ethereum };
      
      console.log('Wallet provider injected into DApp');
    } catch (error) {
      console.error('Failed to inject wallet provider:', error);
    }
  }, [address, currentNetwork]);

  // Navigate to URL
  const navigateToUrl = useCallback((newUrl: string) => {
    if (!newUrl) return;

    // Add protocol if missing
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'https://' + newUrl;
    }

    setIsLoading(true);
    setError(null);
    onLoadStart();

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanGoBack(historyIndex >= 0);
    setCanGoForward(false);

    onUrlChange(newUrl);
  }, [history, historyIndex, onLoadStart, onUrlChange]);

  // Go back
  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCanGoBack(newIndex > 0);
      setCanGoForward(true);
      onUrlChange(history[newIndex]);
    }
  }, [history, historyIndex, onUrlChange]);

  // Go forward
  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCanGoBack(true);
      setCanGoForward(newIndex < history.length - 1);
      onUrlChange(history[newIndex]);
    }
  }, [history, historyIndex, onUrlChange]);

  // Refresh
  const refresh = useCallback(() => {
    if (url) {
      navigateToUrl(url);
    }
  }, [url, navigateToUrl]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
    onLoadEnd();
    
    // Inject wallet provider after load
    setTimeout(injectWalletProvider, 100);
  }, [onLoadEnd, injectWalletProvider]);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    const errorMsg = 'Failed to load website. This may be due to security restrictions or network issues.';
    setError(errorMsg);
    onError(errorMsg);
  }, [onError]);

  // Handle iframe load start
  const handleIframeLoadStart = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  // Navigate to initial URL
  useEffect(() => {
    if (url) {
      navigateToUrl(url);
    }
  }, [url, navigateToUrl]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Browser Controls */}
      <div className="flex items-center gap-2 p-2 bg-gray-100 border-b">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Go back"
        >
          ←
        </button>
        <button
          onClick={goForward}
          disabled={!canGoForward}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Go forward"
        >
          →
        </button>
        <button
          onClick={refresh}
          className="p-2 rounded hover:bg-gray-200"
          title="Refresh"
        >
          ↻
        </button>
        <div className="flex-1 mx-2">
          <input
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            className="w-full px-3 py-1 border rounded text-sm"
            placeholder="Enter URL..."
          />
        </div>
        <div className="text-xs text-gray-500">
          {isLoading ? 'Loading...' : 'Ready'}
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative">
        {error ? (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Cannot Load Website</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={refresh}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div ref={browserRef} className="h-full w-full">
            <iframe
              src={url}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              onLoadStart={handleIframeLoadStart}
              title="DApp Browser"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads"
              allow="camera; microphone; geolocation; payment; usb; bluetooth; clipboard-read; clipboard-write"
            />
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
