'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWalletStore } from '@/store/wallet';

interface AdvancedBrowserProps {
  url: string;
  onUrlChange: (url: string) => void;
  onLoadStart: () => void;
  onLoadEnd: () => void;
  onError: (error: string) => void;
}

export const AdvancedBrowser: React.FC<AdvancedBrowserProps> = ({
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
  const [pageContent, setPageContent] = useState<string>('');
  const [isUsingProxy, setIsUsingProxy] = useState(false);
  const browserRef = useRef<HTMLDivElement>(null);

  // Fetch page content using a proxy approach
  const fetchPageContent = useCallback(async (targetUrl: string) => {
    try {
      setIsLoading(true);
      setError(null);
      onLoadStart();

      // Try to fetch the page content
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(targetUrl)}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      
      // Process the content to make it work in our environment
      const processedContent = processPageContent(content, targetUrl);
      setPageContent(processedContent);
      setIsUsingProxy(true);
      
      setIsLoading(false);
      onLoadEnd();
    } catch (error) {
      console.error('Failed to fetch page:', error);
      setError(`Failed to load page: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
      onError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [onLoadStart, onLoadEnd, onError]);

  // Process page content to work in our environment
  const processPageContent = useCallback((content: string, baseUrl: string) => {
    // Convert relative URLs to absolute URLs
    const baseUrlObj = new URL(baseUrl);
    const baseUrlOrigin = baseUrlObj.origin;
    
    // Replace relative URLs with absolute URLs
    let processedContent = content
      .replace(/src="\/([^"]*)"/g, `src="${baseUrlOrigin}/$1"`)
      .replace(/href="\/([^"]*)"/g, `href="${baseUrlOrigin}/$1"`)
      .replace(/url\(\/([^)]*)\)/g, `url(${baseUrlOrigin}/$1)`)
      .replace(/src='\/([^']*)'/g, `src='${baseUrlOrigin}/$1'`)
      .replace(/href='\/([^']*)'/g, `href='${baseUrlOrigin}/$1'`)
      .replace(/url\('\/\/([^)]*)\)/g, `url('${baseUrlOrigin}/$1)`);

    // Inject wallet provider
    const walletScript = `
      <script>
        (function() {
          const ethereum = {
            isMetaMask: true,
            isConnected: () => !!window.walletAddress,
            request: async ({ method, params }) => {
              console.log('DApp request:', method, params);
              
              switch (method) {
                case 'eth_requestAccounts':
                  return window.walletAddress ? [window.walletAddress] : [];
                case 'eth_accounts':
                  return window.walletAddress ? [window.walletAddress] : [];
                case 'eth_chainId':
                  return window.chainId ? '0x' + window.chainId.toString(16) : '0x1';
                case 'eth_sendTransaction':
                  console.log('Transaction request:', params);
                  return '0x1234567890abcdef';
                case 'personal_sign':
                  console.log('Sign request:', params);
                  return '0xabcdef1234567890';
                default:
                  throw new Error('Unsupported method: ' + method);
              }
            },
            on: (event, callback) => {
              console.log('DApp event listener:', event);
            },
            removeListener: (event, callback) => {
              console.log('DApp remove listener:', event);
            }
          };
          
          window.ethereum = ethereum;
          window.web3 = { currentProvider: ethereum };
          window.walletAddress = '${address || ''}';
          window.chainId = ${currentNetwork?.chainId || 1};
          
          console.log('Wallet provider injected into DApp');
        })();
      </script>
    `;

    // Inject the wallet script before closing head tag
    if (processedContent.includes('</head>')) {
      processedContent = processedContent.replace('</head>', walletScript + '</head>');
    } else {
      processedContent = walletScript + processedContent;
    }

    return processedContent;
  }, [address, currentNetwork]);

  // Navigate to URL
  const navigateToUrl = useCallback((newUrl: string) => {
    if (!newUrl) return;

    // Add protocol if missing
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'https://' + newUrl;
    }

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanGoBack(historyIndex >= 0);
    setCanGoForward(false);

    onUrlChange(newUrl);
    
    // Fetch the page content
    fetchPageContent(newUrl);
  }, [history, historyIndex, onUrlChange, fetchPageContent]);

  // Go back
  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCanGoBack(newIndex > 0);
      setCanGoForward(true);
      const targetUrl = history[newIndex];
      onUrlChange(targetUrl);
      fetchPageContent(targetUrl);
    }
  }, [history, historyIndex, onUrlChange, fetchPageContent]);

  // Go forward
  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCanGoBack(true);
      setCanGoForward(newIndex < history.length - 1);
      const targetUrl = history[newIndex];
      onUrlChange(targetUrl);
      fetchPageContent(targetUrl);
    }
  }, [history, historyIndex, onUrlChange, fetchPageContent]);

  // Refresh
  const refresh = useCallback(() => {
    if (url) {
      fetchPageContent(url);
    }
  }, [url, fetchPageContent]);

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
          {isLoading ? 'Loading...' : isUsingProxy ? 'Proxy Mode' : 'Ready'}
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
        ) : pageContent ? (
          <div 
            ref={browserRef}
            className="h-full w-full overflow-auto"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
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
