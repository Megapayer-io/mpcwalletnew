'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Wallet, Lock, Unlock, Shield, Globe } from 'lucide-react';
import SecuritySettings from './SecuritySettings';
import HardwareWalletManager from './HardwareWalletManager';

export function Header() {
  const { isUnlocked, address, currentNetwork, lock, logout } = useWalletStore();
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showHardwareWallet, setShowHardwareWallet] = useState(false);

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all wallet data? This will remove all accounts and networks.')) {
      // Debug: Log what's in localStorage
      console.log('Current localStorage contents:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          console.log(`${key}:`, localStorage.getItem(key));
        }
      }
      
      // Clear all localStorage keys related to the wallet
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('mpc-wallet') || key.includes('wallet'))) {
          keysToRemove.push(key);
        }
      }
      
      console.log('Removing keys:', keysToRemove);
      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.clear(); // Clear everything as backup
      
      // Force reload
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Wallet className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MPC Wallet</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/receive"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Receive
            </Link>
            <Link
              href="/send"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Send
            </Link>
            <Link
              href="/nfts"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              NFTs
            </Link>
            <Link
              href="/history"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              History
            </Link>
            <Link
              href="/browser"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Browser
            </Link>
            <Link
              href="/networks"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Networks
            </Link>
            <button
              onClick={() => setShowHardwareWallet(true)}
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Hardware Wallet
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Debug button - remove in production */}
            <button
              onClick={clearAllData}
              className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
              title="Clear all wallet data (debug)"
            >
              Clear Data
            </button>
            
            {isUnlocked && address && (
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600">
                  <div className="font-medium">{currentNetwork?.name}</div>
                  <div className="text-xs text-gray-500">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
                <button
                  onClick={() => setShowSecuritySettings(true)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Security Settings"
                >
                  <Shield className="h-4 w-4" />
                </button>
                <button
                  onClick={lock}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Lock wallet"
                >
                  <Lock className="h-4 w-4" />
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Settings Modal */}
        <SecuritySettings 
          isOpen={showSecuritySettings} 
          onClose={() => setShowSecuritySettings(false)} 
        />

      {/* Hardware Wallet Modal */}
        <HardwareWalletManager 
          isOpen={showHardwareWallet} 
          onClose={() => setShowHardwareWallet(false)} 
        />

    </header>
  );
}
