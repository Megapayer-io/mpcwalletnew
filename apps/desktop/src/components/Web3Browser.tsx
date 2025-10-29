'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Web3Provider } from './Web3Provider';
import { 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Home, 
  Bookmark, 
  Star, 
  ExternalLink,
  Shield,
  Globe,
  Search,
  X,
  Lock,
  Unlock,
  Settings,
  Plus
} from 'lucide-react';

interface DApp {
  name: string;
  url: string;
  description: string;
  category: string;
  icon?: string;
  isBookmarked?: boolean;
}

interface Web3BrowserProps {
  className?: string;
}

export const Web3Browser: React.FC<Web3BrowserProps> = ({ className = '' }) => {
  const { address, currentNetwork, isUnlocked } = useWalletStore();
  const [currentUrl, setCurrentUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [bookmarks, setBookmarks] = useState<DApp[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [browserError, setBrowserError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks();
  }, []);

  // Check wallet connection status
  useEffect(() => {
    setIsConnected(!!address && isUnlocked);
  }, [address, isUnlocked]);

  const loadBookmarks = () => {
    try {
      const saved = localStorage.getItem('mpc-wallet-dapp-bookmarks');
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  };

  const saveBookmarks = (newBookmarks: DApp[]) => {
    try {
      localStorage.setItem('mpc-wallet-dapp-bookmarks', JSON.stringify(newBookmarks));
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  };

  const addBookmark = (dapp: DApp) => {
    const newBookmark = { ...dapp, isBookmarked: true };
    const updatedBookmarks = [...bookmarks, newBookmark];
    saveBookmarks(updatedBookmarks);
  };

  const addCurrentPageBookmark = () => {
    if (currentUrl) {
      const domain = getDomainFromUrl(currentUrl);
      const newBookmark: DApp = {
        name: domain,
        url: currentUrl,
        description: `Bookmarked DApp from ${domain}`,
        category: 'DApp',
        icon: '🌐',
        isBookmarked: true
      };
      addBookmark(newBookmark);
    }
  };

  const removeBookmark = (url: string) => {
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.url !== url);
    saveBookmarks(updatedBookmarks);
  };

  const navigateToUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    setCurrentUrl(url);
    setUrlInput(url);
    setIsLoading(true);
    setShowBookmarks(false);
    setBrowserError(null);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(url);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanGoBack(historyIndex >= 0);
    setCanGoForward(false);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToUrl(urlInput);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCanGoBack(newIndex > 0);
      setCanGoForward(true);
      setCurrentUrl(history[newIndex]);
      setUrlInput(history[newIndex]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCanGoBack(true);
      setCanGoForward(newIndex < history.length - 1);
      setCurrentUrl(history[newIndex]);
      setUrlInput(history[newIndex]);
    }
  };

  const refresh = () => {
    if (iframeRef.current && currentUrl) {
      iframeRef.current.src = iframeRef.current.src;
      setIsLoading(true);
    }
  };

  const goHome = () => {
    setCurrentUrl('');
    setUrlInput('');
    setShowBookmarks(false);
    setBrowserError(null);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setBrowserError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setBrowserError('Failed to load website. This may be due to security restrictions or network issues.');
  };

  const openInNewTab = () => {
    if (currentUrl) {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const isBookmarked = (url: string) => {
    return bookmarks.some(bookmark => bookmark.url === url);
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const popularDApps: DApp[] = [
    {
      name: 'Uniswap',
      url: 'https://app.uniswap.org',
      description: 'Decentralized exchange for trading tokens',
      category: 'DeFi',
      icon: '🦄'
    },
    {
      name: 'OpenSea',
      url: 'https://opensea.io',
      description: 'NFT marketplace',
      category: 'NFT',
      icon: '🌊'
    },
    {
      name: 'Aave',
      url: 'https://app.aave.com',
      description: 'Lending and borrowing protocol',
      category: 'DeFi',
      icon: '👻'
    },
    {
      name: 'Compound',
      url: 'https://app.compound.finance',
      description: 'Money markets protocol',
      category: 'DeFi',
      icon: '🔗'
    }
  ];

  return (
    <div className={`h-full w-full flex flex-col bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Web3 Browser</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              {currentNetwork?.name || 'No Network'}
            </div>
            {address && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={goBack}
              disabled={!canGoBack}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goForward}
              disabled={!canGoForward}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Go forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={refresh}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={goHome}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Home"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* URL Bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter DApp URL or search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go
            </button>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Bookmarks"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            
            {currentUrl && !isBookmarked(currentUrl) && (
              <button
                onClick={addCurrentPageBookmark}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Bookmark this page"
              >
                <Star className="w-4 h-4" />
              </button>
            )}

            {currentUrl && (
              <button
                onClick={openInNewTab}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`border-l-4 p-4 ${isConnected ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isConnected ? (
              <Unlock className="w-5 h-5 text-green-400 mr-2" />
            ) : (
              <Lock className="w-5 h-5 text-yellow-400 mr-2" />
            )}
            <p className={isConnected ? 'text-green-700' : 'text-yellow-700'}>
              {isConnected 
                ? `Wallet connected - Ready to interact with DApps` 
                : 'Please unlock your wallet to interact with DApps'
              }
            </p>
          </div>
          {isConnected && address && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Connected
            </div>
          )}
        </div>
      </div>

      {/* Bookmarks */}
      {showBookmarks && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Bookmarks</h2>
            <button
              onClick={() => setShowBookmarks(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarks.map((dapp) => (
                <div
                  key={dapp.url}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigateToUrl(dapp.url)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{dapp.icon || '🌐'}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{dapp.name}</h3>
                        <p className="text-sm text-gray-600">{dapp.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBookmark(dapp.url);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{dapp.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{getDomainFromUrl(dapp.url)}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No bookmarks yet</p>
              <p className="text-sm">Visit DApps and bookmark them for quick access</p>
            </div>
          )}
        </div>
      )}

      {/* Browser Content */}
      <div className="flex-1">
        {!currentUrl ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center max-w-2xl mx-auto px-4">
              <Globe className="w-20 h-20 text-blue-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Web3 Browser</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Discover and interact with decentralized applications. Enter a URL above or explore popular DApps below.
              </p>
              
              {/* Popular DApps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {popularDApps.map((dapp) => (
                  <div
                    key={dapp.url}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                    onClick={() => navigateToUrl(dapp.url)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">{dapp.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{dapp.name}</h3>
                        <p className="text-sm text-gray-600">{dapp.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{dapp.description}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm text-gray-500">
                <p>• Enter any DApp URL in the address bar</p>
                <p>• Bookmark DApps for quick access</p>
                <p>• Connect your wallet to interact with DApps</p>
                <p>• Navigate with back/forward buttons</p>
              </div>
            </div>
          </div>
        ) : browserError ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Cannot Load Website</h3>
              <p className="text-gray-600 mb-4">{browserError}</p>
              <div className="space-y-2">
                <button
                  onClick={refresh}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={openInNewTab}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Loading DApp...</p>
                </div>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              src={currentUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Web3 Browser"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads"
              allow="camera; microphone; geolocation; payment; usb; bluetooth; clipboard-read; clipboard-write"
            />
            <Web3Provider iframeRef={iframeRef} />
          </div>
        )}
      </div>
    </div>
  );
};
