'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { 
  Settings, 
  ExternalLink, 
  Copy, 
  Check,
  ChevronDown,
  LogOut,
  User
} from 'lucide-react';

interface ExtensionHeaderProps {
  showUserMenu?: boolean;
}

export function ExtensionHeader({ showUserMenu = true }: ExtensionHeaderProps) {
  const { address, isUnlocked, lock } = useWalletStore();
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLock = () => {
    lock();
    setShowMenu(false);
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const openExplorer = () => {
    if (address && address.startsWith('0x')) {
      const explorerUrl = `https://etherscan.io/address/${address}`;
      chrome.tabs.create({ url: explorerUrl });
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">MPC Wallet</h1>
            <p className="text-xs text-gray-500">Professional Web3</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Settings */}
          <button
            onClick={openOptions}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Menu */}
          {showUserMenu && isUnlocked && address && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">MPC Wallet</p>
                        <p className="text-xs text-gray-500">Connected</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Wallet Address
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg mb-2">
                      <p className="text-sm font-mono text-gray-900 break-all">
                        {address}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <button
                        onClick={handleCopyAddress}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>{copied ? 'Copied!' : 'Copy Address'}</span>
                      </button>
                      
                      <button
                        onClick={openExplorer}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View on Explorer</span>
                      </button>
                      
                      <button
                        onClick={openOptions}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-200 my-2"></div>
                    
                    <button
                      onClick={handleLock}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Lock Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
