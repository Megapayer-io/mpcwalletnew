'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWalletStore } from '@/store/wallet';
import { WalletProvider } from '@/components/WalletProvider';
import { 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Home, 
  Bookmark, 
  Star, 
  ExternalLink,
  Shield,
  AlertTriangle,
  Globe,
  Search,
  X
} from 'lucide-react';

interface DApp {
  name: string;
  url: string;
  description: string;
  category: string;
  icon?: string;
  isBookmarked?: boolean;
}

// No fake data - users will add their own DApps via bookmarks

export default function BrowserPage() {
  const { address, currentNetwork, isUnlocked } = useWalletStore();
  const [currentUrl, setCurrentUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [bookmarks, setBookmarks] = useState<DApp[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadBookmarks();
  }, []);

  useEffect(() => {
    if (!isUnlocked) {
      setSecurityWarning('Please unlock your wallet to interact with DApps');
    } else {
      setSecurityWarning(null);
    }
  }, [isUnlocked]);

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
    setShowPopular(false);
    setShowBookmarks(false);
    setIframeError(false);
    setSecurityWarning(null);
    
    // Set a timeout to detect if iframe fails to load
    setTimeout(() => {
      if (isLoading) {
        handleIframeError();
      }
    }, 10000); // 10 second timeout
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToUrl(urlInput);
  };

  const goBack = () => {
    if (canGoBack && iframeRef.current) {
      iframeRef.current.contentWindow?.history.back();
    }
  };

  const goForward = () => {
    if (canGoForward && iframeRef.current) {
      iframeRef.current.contentWindow?.history.forward();
    }
  };

  const refresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
      setIsLoading(true);
    }
  };

  const goHome = () => {
    setCurrentUrl('');
    setUrlInput('');
    setShowPopular(false);
    setShowBookmarks(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setCanGoBack(true);
    setCanGoForward(false);
    setIframeError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setIframeError(true);
  };

  const openInNewTab = () => {
    if (currentUrl) {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // No fake data filtering - only real bookmarks

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

  return (
    <div className="min-h-screen bg-gray-50">
      <WalletProvider />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">DApp Browser</h1>
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
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goForward}
              disabled={!canGoForward}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={refresh}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={goHome}
              className="p-2 rounded-lg hover:bg-gray-100"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go
            </button>
          </form>

          {/* Bookmarks Button */}
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          
          {/* Add Current Page to Bookmarks */}
          {currentUrl && !isBookmarked(currentUrl) && (
            <button
              onClick={addCurrentPageBookmark}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Bookmark this page"
            >
              <Star className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className={`border-l-4 p-4 ${isUnlocked ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isUnlocked ? (
              <Shield className="w-5 h-5 text-green-400 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
            )}
            <p className={isUnlocked ? 'text-green-700' : 'text-yellow-700'}>
              {isUnlocked 
                ? `Wallet connected - Ready to interact with DApps` 
                : 'Please unlock your wallet to interact with DApps'
              }
            </p>
          </div>
          {isUnlocked && address && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Connected
            </div>
          )}
        </div>
      </div>

      {/* Bookmarks Only - No Fake Data */}
      {showBookmarks && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Bookmarks</h2>
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
                      className="text-gray-400 hover:text-red-500"
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
          <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center max-w-md mx-auto px-4">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">DApp Browser</h2>
              <p className="text-gray-600 mb-6">
                Enter a DApp URL above to start browsing, or use the bookmark button to save your favorite DApps.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Enter any DApp URL in the address bar</p>
                <p>• Bookmark DApps for quick access</p>
                <p>• Connect your wallet to interact with DApps</p>
              </div>
            </div>
          </div>
        ) : iframeError ? (
          <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center max-w-md mx-auto px-4">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cannot Load Website</h2>
              <p className="text-gray-600 mb-6">
                This website cannot be displayed in the browser due to security restrictions. 
                Many websites block iframe embedding for security reasons.
              </p>
              <div className="space-y-4">
                <button
                  onClick={openInNewTab}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open in New Tab
                </button>
                <button
                  onClick={() => {
                    setIframeError(false);
                    setCurrentUrl('');
                    setUrlInput('');
                  }}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Go Back
                </button>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                <p>Common websites that don't allow iframe embedding:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Block explorers (Polygonscan, Etherscan)</li>
                  <li>• Social media platforms</li>
                  <li>• Banking websites</li>
                  <li>• Many security-focused sites</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
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
              className="w-full h-screen"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="DApp Browser"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
            />
          </>
        )}
      </div>
    </div>
  );
}
