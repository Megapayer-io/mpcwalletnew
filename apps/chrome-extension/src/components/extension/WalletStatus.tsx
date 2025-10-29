'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';

interface WalletStatusProps {
  address: string | null;
  balance: string;
  network: any;
}

export function WalletStatus({ address, balance, network }: WalletStatusProps) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { getBalance } = useWalletStore();

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefreshBalance = async () => {
    if (!address) return;
    
    setIsRefreshing(true);
    try {
      await getBalance(address);
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const openExplorer = () => {
    if (address && address.startsWith('0x')) {
      const explorerUrl = `https://etherscan.io/address/${address}`;
      chrome.tabs.create({ url: explorerUrl });
    }
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.00';
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!address) {
    return (
      <div className="wallet-card">
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No wallet connected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Wallet Status</h3>
        <button
          onClick={handleRefreshBalance}
          disabled={isRefreshing}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          title="Refresh balance"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            {formatBalance(balance)} ETH
          </span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Connected</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          ≈ ${(parseFloat(balance) * 2000).toFixed(2)} USD
        </p>
      </div>

      {/* Address */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Address</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleCopyAddress}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Copy address"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={openExplorer}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="View on explorer"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
        <p className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded mt-1">
          {formatAddress(address)}
        </p>
      </div>

      {/* Network */}
      {network && (
        <div>
          <span className="text-xs text-gray-500">Network</span>
          <div className="flex items-center space-x-2 mt-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">{network.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
