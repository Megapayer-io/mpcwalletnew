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
    icon: '🔷'
  },
  {
    name: '1inch',
    url: 'https://app.1inch.io',
    description: 'DEX aggregator',
    category: 'DeFi',
    icon: '1️⃣'
  },
  {
    name: 'PancakeSwap',
    url: 'https://pancakeswap.finance',
    description: 'BSC DEX and yield farming',
    category: 'DeFi',
    icon: '🥞'
  }
];

export default function BrowserPage() {
  const { address, currentNetwork, isUnlocked } = useWalletStore();
  const [currentUrl, setCurrentUrl] = useState('https://app.uniswap.org');
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [bookmarks, setBookmarks] = useState<DApp[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showPopular, setShowPopular] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
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
    navigateToUrl('https://app.uniswap.org');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setCanGoBack(true);
    setCanGoForward(false);
  };

  const filteredDApps = popularDApps.filter(dapp =>
    dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dapp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dapp.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Popular DApps / Bookmarks */}
      {(showPopular || showBookmarks) && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {showBookmarks ? 'Bookmarks' : 'Popular DApps'}
            </h2>
            {!showBookmarks && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search DApps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(showBookmarks ? bookmarks : filteredDApps).map((dapp) => (
              <div
                key={dapp.url}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigateToUrl(dapp.url)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{dapp.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{dapp.name}</h3>
                      <p className="text-sm text-gray-600">{dapp.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isBookmarked(dapp.url)) {
                        removeBookmark(dapp.url);
                      } else {
                        addBookmark(dapp);
                      }
                    }}
                    className="text-gray-400 hover:text-yellow-500"
                  >
                    <Star className={`w-4 h-4 ${isBookmarked(dapp.url) ? 'fill-current text-yellow-500' : ''}`} />
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

          {showBookmarks && bookmarks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No bookmarks yet</p>
              <p className="text-sm">Star DApps to add them to your bookmarks</p>
            </div>
          )}
        </div>
      )}

      {/* Browser Content */}
      <div className="flex-1">
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
          title="DApp Browser"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
