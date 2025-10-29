'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Plus, Trash2, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface Token {
  address: string;
  symbol: string;
  decimals: number;
  name?: string;
  balance?: string;
}

export function TokenManager() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [newToken, setNewToken] = useState({
    address: '',
    symbol: '',
    decimals: 18,
    name: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [metadataFetched, setMetadataFetched] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  
  const { getTokenBalance, getTokenMetadata, getUsdBalance, address, currentNetwork } = useWalletStore();

  // Load tokens from storage
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const result = await chrome.storage.local.get(['customTokens']);
        if (result.customTokens) {
          setTokens(result.customTokens);
        }
      } catch (error) {
        console.error('Failed to load tokens:', error);
      }
    };

    loadTokens();
  }, []);

  // Save tokens to storage
  const saveTokens = async (newTokens: Token[]) => {
    try {
      await chrome.storage.local.set({ customTokens: newTokens });
      setTokens(newTokens);
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  };

  // Load token balances
  const loadTokenBalances = async () => {
    if (!address || tokens.length === 0) return;

    setIsLoadingBalances(true);
    const newBalances: Record<string, string> = {};

    try {
      await Promise.all(
        tokens.map(async (token) => {
          try {
            const balance = await getTokenBalance({
              tokenAddress: token.address,
              decimals: token.decimals
            });
            newBalances[token.address] = balance;
          } catch (error) {
            console.error(`Failed to load balance for ${token.symbol}:`, error);
            newBalances[token.address] = '0';
          }
        })
      );

      setTokenBalances(newBalances);
    } catch (error) {
      console.error('Failed to load token balances:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Load balances when tokens or address changes
  useEffect(() => {
    loadTokenBalances();
  }, [tokens, address]);

  // Auto-fetch token metadata when address is entered
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!newToken.address || newToken.address.length < 42 || metadataFetched) {
        return;
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(newToken.address)) {
        return;
      }

      setError('');

      try {
        const metadata = await getTokenMetadata(newToken.address);
        setNewToken(prev => ({
          ...prev,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
          name: metadata.name
        }));
        setMetadataFetched(true);
      } catch (error) {
        setError('Failed to fetch token metadata. Please enter manually.');
        console.error('Failed to fetch token metadata:', error);
      }
    };

    const timeoutId = setTimeout(fetchMetadata, 500);
    return () => clearTimeout(timeoutId);
  }, [newToken.address, getTokenMetadata, metadataFetched]);

  const handleAddToken = async () => {
    if (!newToken.address || !newToken.symbol) {
      setError('Address and symbol are required');
      return;
    }

    if (tokens.some(t => t.address.toLowerCase() === newToken.address.toLowerCase())) {
      setError('Token already added');
      return;
    }

    setError('');

    try {
      const balance = await getTokenBalance({
        tokenAddress: newToken.address,
        address: address || undefined,
        decimals: newToken.decimals
      });

      const token: Token = {
        address: newToken.address,
        symbol: newToken.symbol,
        decimals: newToken.decimals,
        name: newToken.name,
        balance
      };

      await saveTokens([...tokens, token]);
      setNewToken({ address: '', symbol: '', decimals: 18, name: '' });
      setMetadataFetched(false);
    } catch (error) {
      setError('Invalid token address or failed to load balance');
      console.error('Failed to add token:', error);
    }
  };

  const handleRemoveToken = async (address: string) => {
    const newTokens = tokens.filter(t => t.address !== address);
    await saveTokens(newTokens);
  };

  const formatBalance = (balance: string | undefined) => {
    if (!balance) return 'Loading...';
    const num = parseFloat(balance);
    return num.toFixed(6);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Token Management</h2>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            if (!isAdding) {
              setNewToken({ address: '', symbol: '', decimals: 18, name: '' });
              setError('');
              setMetadataFetched(false);
            }
          }}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Token</span>
        </button>
      </div>

      {isAdding && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add Custom Token</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Token Contract Address *</label>
              <input
                type="text"
                placeholder="0x..."
                value={newToken.address}
                onChange={(e) => {
                  setNewToken(prev => ({ ...prev, address: e.target.value }));
                  setMetadataFetched(false);
                  setError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste the contract address and token details will be fetched automatically
              </p>
            </div>
            
            {metadataFetched && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✓ Token metadata fetched successfully
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Symbol</label>
                <input
                  type="text"
                  placeholder="e.g., USDC"
                  value={newToken.symbol}
                  onChange={(e) => setNewToken(prev => ({ ...prev, symbol: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Decimals</label>
                <input
                  type="number"
                  placeholder="18"
                  value={newToken.decimals}
                  onChange={(e) => setNewToken(prev => ({ ...prev, decimals: parseInt(e.target.value) || 18 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  min="0"
                  max="18"
                />
              </div>
            </div>

            {newToken.name && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Token Name</label>
                <input
                  type="text"
                  value={newToken.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-sm text-gray-600"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex space-x-2">
              <button
                onClick={handleAddToken}
                disabled={!newToken.address || !newToken.symbol}
                className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Token
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewToken({ address: '', symbol: '', decimals: 18, name: '' });
                  setError('');
                  setMetadataFetched(false);
                }}
                className="px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tokens.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No custom tokens added yet</p>
            <p className="text-xs mt-1">Click "Add Token" to add custom tokens</p>
          </div>
        ) : (
          tokens.map((token) => {
            const balance = tokenBalances[token.address] || '0';
            
            return (
              <div key={token.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{token.symbol}</span>
                    <span className="text-xs text-gray-500 font-mono">
                      {token.address.slice(0, 6)}...{token.address.slice(-4)}
                    </span>
                  </div>
                  {token.name && (
                    <div className="text-xs text-gray-500">
                      {token.name}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    Balance: {isLoadingBalances ? (
                      <span className="flex items-center space-x-1">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Loading...</span>
                      </span>
                    ) : (
                      `${parseFloat(balance).toFixed(6)} ${token.symbol}`
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={loadTokenBalances}
                    disabled={isLoadingBalances}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    title="Refresh balance"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingBalances ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleRemoveToken(token.address)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Remove token"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
