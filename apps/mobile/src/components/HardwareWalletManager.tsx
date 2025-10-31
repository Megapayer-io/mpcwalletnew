'use client';

import React, { useState, useEffect } from 'react';
import { HardwareWalletType, hardwareWalletManager } from '@evm-wallet/sdk';

interface HardwareWalletManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HardwareWalletManager({ isOpen, onClose }: HardwareWalletManagerProps) {
  const [connectedWallets, setConnectedWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<HardwareWalletType | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAccounts, setShowAccounts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConnectedWallets();
    }
  }, [isOpen]);

  const loadConnectedWallets = () => {
    const wallets = hardwareWalletManager.getConnectedWallets();
    setConnectedWallets(wallets);
  };

  const handleConnectWallet = async (type: HardwareWalletType) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const walletInfo = await hardwareWalletManager.connectWallet(type);
      setSuccess(`${walletInfo.name} connected successfully!`);
      loadConnectedWallets();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = async (type: HardwareWalletType) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await hardwareWalletManager.disconnectWallet(type);
      setSuccess('Wallet disconnected successfully!');
      loadConnectedWallets();
      setAccounts([]);
      setShowAccounts(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAccounts = async (type: HardwareWalletType) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const walletAccounts = await hardwareWalletManager.getAccounts(type, 5);
      setAccounts(walletAccounts);
      setSelectedWallet(type);
      setShowAccounts(true);
      setSuccess(`Found ${walletAccounts.length} accounts`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const getWalletDisplayName = (type: HardwareWalletType): string => {
    switch (type) {
      case HardwareWalletType.LEDGER:
        return 'Ledger';
      case HardwareWalletType.TREZOR:
        return 'Trezor';
      case HardwareWalletType.KEEPKEY:
        return 'KeepKey';
      case HardwareWalletType.BITBOX:
        return 'BitBox';
      default:
        return type;
    }
  };

  const getWalletDescription = (type: HardwareWalletType): string => {
    switch (type) {
      case HardwareWalletType.LEDGER:
        return 'Secure hardware wallet with USB connection';
      case HardwareWalletType.TREZOR:
        return 'Open-source hardware wallet with web interface';
      case HardwareWalletType.KEEPKEY:
        return 'Large screen hardware wallet for easy verification';
      case HardwareWalletType.BITBOX:
        return 'Swiss-made hardware wallet with touch interface';
      default:
        return 'Hardware wallet';
    }
  };

  const getWalletIcon = (type: HardwareWalletType): string => {
    switch (type) {
      case HardwareWalletType.LEDGER:
        return '🔒';
      case HardwareWalletType.TREZOR:
        return '🛡️';
      case HardwareWalletType.KEEPKEY:
        return '🔑';
      case HardwareWalletType.BITBOX:
        return '📱';
      default:
        return '💳';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Hardware Wallet Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        <div className="space-y-6">
          {/* Connected Wallets */}
          {connectedWallets.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Wallets</h3>
              <div className="space-y-3">
                {connectedWallets.map((wallet) => (
                  <div key={wallet.type} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getWalletIcon(wallet.type)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{wallet.name}</h4>
                        <p className="text-sm text-gray-500">
                          {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGetAccounts(wallet.type)}
                        disabled={isLoading}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Get Accounts
                      </button>
                      <button
                        onClick={() => handleDisconnectWallet(wallet.type)}
                        disabled={isLoading}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Wallets */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Hardware Wallets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(HardwareWalletType).map((type) => {
                const isConnected = hardwareWalletManager.isWalletConnected(type);
                return (
                  <div
                    key={type}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      isConnected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-3xl">{getWalletIcon(type)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{getWalletDisplayName(type)}</h4>
                        <p className="text-sm text-gray-500">{getWalletDescription(type)}</p>
                      </div>
                    </div>
                    
                    {isConnected ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 text-sm font-medium">✓ Connected</span>
                        <button
                          onClick={() => handleGetAccounts(type)}
                          disabled={isLoading}
                          className="ml-auto px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Manage
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnectWallet(type)}
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Connect {getWalletDisplayName(type)}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Accounts */}
          {showAccounts && accounts.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Accounts from {selectedWallet && getWalletDisplayName(selectedWallet)}
              </h3>
              <div className="space-y-2">
                {accounts.map((account, index) => (
                  <div key={account.address} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <p className="font-medium text-gray-900">
                        Account {account.index + 1}
                      </p>
                      <p className="text-sm text-gray-500 font-mono">
                        {account.address}
                      </p>
                      <p className="text-xs text-gray-400">
                        Path: {account.derivationPath}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(account.address);
                        setSuccess('Address copied to clipboard!');
                      }}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Setup Instructions</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Connect your hardware wallet to your computer</li>
              <li>2. Unlock your hardware wallet</li>
              <li>3. Make sure your hardware wallet is connected to the correct network</li>
              <li>4. Click "Connect" for your specific hardware wallet</li>
              <li>5. Follow the prompts on your hardware wallet to authorize the connection</li>
            </ol>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
