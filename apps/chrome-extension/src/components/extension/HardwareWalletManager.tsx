'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Shield, Check, AlertTriangle, ExternalLink, Copy } from 'lucide-react';

export function HardwareWalletManager() {
  const [connectedWallets, setConnectedWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAccounts, setShowAccounts] = useState(false);

  const { currentNetwork } = useWalletStore();

  useEffect(() => {
    loadConnectedWallets();
  }, []);

  const loadConnectedWallets = async () => {
    try {
      const result = await chrome.storage.local.get(['connectedHardwareWallets']);
      setConnectedWallets(result.connectedHardwareWallets || []);
    } catch (error) {
      console.error('Failed to load connected wallets:', error);
    }
  };

  const handleConnectWallet = async (type: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate hardware wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const walletInfo = {
        type,
        name: getWalletDisplayName(type),
        address: '0x' + Math.random().toString(16).substr(2, 40),
        connectedAt: Date.now()
      };

      const newWallets = [...connectedWallets, walletInfo];
      await chrome.storage.local.set({ connectedHardwareWallets: newWallets });
      setConnectedWallets(newWallets);
      setSuccess(`${walletInfo.name} connected successfully!`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = async (type: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const newWallets = connectedWallets.filter(wallet => wallet.type !== type);
      await chrome.storage.local.set({ connectedHardwareWallets: newWallets });
      setConnectedWallets(newWallets);
      setAccounts([]);
      setShowAccounts(false);
      setSuccess('Wallet disconnected successfully!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAccounts = async (type: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate getting accounts from hardware wallet
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const walletAccounts = [
        {
          address: '0x' + Math.random().toString(16).substr(2, 40),
          index: 0,
          derivationPath: "m/44'/60'/0'/0/0"
        },
        {
          address: '0x' + Math.random().toString(16).substr(2, 40),
          index: 1,
          derivationPath: "m/44'/60'/0'/0/1"
        }
      ];
      
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

  const getWalletDisplayName = (type: string): string => {
    switch (type) {
      case 'ledger':
        return 'Ledger';
      case 'trezor':
        return 'Trezor';
      case 'keepkey':
        return 'KeepKey';
      case 'bitbox':
        return 'BitBox';
      default:
        return type;
    }
  };

  const getWalletDescription = (type: string): string => {
    switch (type) {
      case 'ledger':
        return 'Secure hardware wallet with USB connection';
      case 'trezor':
        return 'Open-source hardware wallet with web interface';
      case 'keepkey':
        return 'Large screen hardware wallet for easy verification';
      case 'bitbox':
        return 'Swiss-made hardware wallet with touch interface';
      default:
        return 'Hardware wallet';
    }
  };

  const getWalletIcon = (type: string): string => {
    switch (type) {
      case 'ledger':
        return '🔒';
      case 'trezor':
        return '🛡️';
      case 'keepkey':
        return '🔑';
      case 'bitbox':
        return '📱';
      default:
        return '💳';
    }
  };

  const isWalletConnected = (type: string): boolean => {
    return connectedWallets.some(wallet => wallet.type === type);
  };

  const availableWallets = [
    { type: 'ledger', name: 'Ledger', description: 'Secure hardware wallet with USB connection' },
    { type: 'trezor', name: 'Trezor', description: 'Open-source hardware wallet with web interface' },
    { type: 'keepkey', name: 'KeepKey', description: 'Large screen hardware wallet for easy verification' },
    { type: 'bitbox', name: 'BitBox', description: 'Swiss-made hardware wallet with touch interface' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Hardware Wallet Manager</h2>

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
            {availableWallets.map((wallet) => {
              const isConnected = isWalletConnected(wallet.type);
              return (
                <div
                  key={wallet.type}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    isConnected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-3xl">{getWalletIcon(wallet.type)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{wallet.name}</h4>
                      <p className="text-sm text-gray-500">{wallet.description}</p>
                    </div>
                  </div>
                  
                  {isConnected ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 text-sm font-medium">✓ Connected</span>
                      <button
                        onClick={() => handleGetAccounts(wallet.type)}
                        disabled={isLoading}
                        className="ml-auto px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Manage
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnectWallet(wallet.type)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Connect {wallet.name}
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
  );
}
