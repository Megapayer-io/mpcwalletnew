'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { Header } from '@/components/Header';
import { UnlockModal } from '@/components/UnlockModal';
import { TokenList } from '@/components/TokenList';
import { AccountManager } from '@/components/AccountManager';
import { Wallet, Copy, RefreshCw, ExternalLink, Send, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usdBalance, setUsdBalance] = useState<string>('0.00');
  const [isLoadingUsd, setIsLoadingUsd] = useState(false);
  
  const {
    isInitialized,
    hasWallet,
    isUnlocked,
    address,
    currentNetwork,
    balance,
    getBalance,
    getUsdBalance,
    isLoading,
    error
  } = useWalletStore();

  useEffect(() => {
    if (isInitialized && !hasWallet) {
      // No wallet exists, redirect to setup
      router.push('/setup');
      return;
    }
    
    if (isInitialized && hasWallet && !isUnlocked) {
      setShowUnlockModal(true);
    }
  }, [isInitialized, hasWallet, isUnlocked, router]);

  useEffect(() => {
    if (isUnlocked && address) {
      getBalance();
    }
  }, [isUnlocked, address, getBalance]);

  // Load USD balance when balance changes
  useEffect(() => {
    const loadUsdBalance = async () => {
      if (balance && currentNetwork?.symbol) {
        setIsLoadingUsd(true);
        try {
          const usd = await getUsdBalance(balance, currentNetwork.symbol);
          setUsdBalance(usd);
        } catch (error) {
          console.error('Failed to load USD balance:', error);
          setUsdBalance('0.00');
        } finally {
          setIsLoadingUsd(false);
        }
      }
    };

    loadUsdBalance();
  }, [balance, currentNetwork?.symbol, getUsdBalance]);

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const handleRefreshBalance = () => {
    if (isUnlocked && address) {
      getBalance();
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing wallet...</p>
        </div>
      </div>
    );
  }

  if (hasWallet && !isUnlocked) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MPC Wallet</h1>
            <p className="text-gray-600 mb-8">
              Your wallet is locked. Please unlock it to continue.
            </p>
            <button
              onClick={() => setShowUnlockModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Unlock Wallet
            </button>
          </div>
        </div>
        <UnlockModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your wallet and view your balances</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/send"
            className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Send Funds</h3>
              <p className="text-sm text-gray-600">Send tokens to any address</p>
            </div>
          </Link>
          
          <Link
            href="/receive"
            className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="p-2 bg-green-600 text-white rounded-lg">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Receive Funds</h3>
              <p className="text-sm text-gray-600">Share your address or QR code</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Network
                </label>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
                    {currentNetwork?.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    Chain ID: {currentNetwork?.chainId}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-md flex-1">
                    {address || 'No wallet connected'}
                  </span>
                  {address && (
                    <button
                      onClick={handleCopyAddress}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Copy address"
                    >
                      {copied ? (
                        <span className="text-green-600 text-xs">Copied!</span>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Native Balance
                </label>
                <div className="flex items-center space-x-2">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      {isLoading ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                      ) : (
                        `${balance || '0'} ${currentNetwork?.symbol || 'ETH'}`
                      )}
                    </span>
                    {balance && !isLoading && (
                      <div className="text-sm text-gray-600">
                        {isLoadingUsd ? (
                          <span className="flex items-center space-x-1">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            <span>Loading USD...</span>
                          </span>
                        ) : (
                          `$${usdBalance} USD`
                        )}
                      </div>
                    )}
                  </div>
                  {address && (
                    <button
                      onClick={handleRefreshBalance}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      title="Refresh balance"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {currentNetwork?.blockExplorer && address && (
                <div>
                  <a
                    href={`${currentNetwork.blockExplorer}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <span>View on Explorer</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Account Manager */}
          <div>
            <AccountManager />
          </div>

          {/* Token List */}
          <div>
            <TokenList />
          </div>
        </div>
      </div>

      <UnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
      />
    </div>
  );
}
