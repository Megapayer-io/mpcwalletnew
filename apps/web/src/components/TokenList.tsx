'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface Token {
  address: string;
  symbol: string;
  decimals: number;
  balance?: string;
}

export function TokenList() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [newToken, setNewToken] = useState({
    address: '',
    symbol: '',
    decimals: 18
  });
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  
  const { getTokenBalance, address, currentNetwork } = useWalletStore();

  // Load tokens from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('evm-wallet-tokens');
    if (stored) {
      try {
        setTokens(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load tokens:', error);
      }
    }
  }, []);

  // Save tokens to localStorage
  const saveTokens = (newTokens: Token[]) => {
    localStorage.setItem('evm-wallet-tokens', JSON.stringify(newTokens));
    setTokens(newTokens);
  };

  // Load token balances
  useEffect(() => {
    if (tokens.length > 0 && address && currentNetwork) {
      tokens.forEach(async (token) => {
        try {
          const balance = await getTokenBalance({
            tokenAddress: token.address,
            address: address || undefined,
            decimals: token.decimals
          });
          
          setTokens(prev => prev.map(t => 
            t.address === token.address ? { ...t, balance } : t
          ));
        } catch (error) {
          console.error(`Failed to load balance for ${token.symbol}:`, error);
        }
      });
    }
  }, [tokens.length, address, currentNetwork]);

  const handleAddToken = async () => {
    if (!newToken.address || !newToken.symbol) {
      setError('Address and symbol are required');
      return;
    }

    // Check if token already exists
    if (tokens.some(t => t.address.toLowerCase() === newToken.address.toLowerCase())) {
      setError('Token already added');
      return;
    }

    setIsAdding(true);
    setError('');

    try {
      // Try to get balance to validate the token
      const balance = await getTokenBalance({
        tokenAddress: newToken.address,
        address: address || undefined,
        decimals: newToken.decimals
      });

      const token: Token = {
        address: newToken.address,
        symbol: newToken.symbol,
        decimals: newToken.decimals,
        balance
      };

      saveTokens([...tokens, token]);
      setNewToken({ address: '', symbol: '', decimals: 18 });
    } catch (error) {
      setError('Invalid token address or failed to load balance');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveToken = (address: string) => {
    const newTokens = tokens.filter(t => t.address !== address);
    saveTokens(newTokens);
  };

  const formatBalance = (balance: string | undefined) => {
    if (!balance) return 'Loading...';
    const num = parseFloat(balance);
    return num.toFixed(6);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tokens</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Token</span>
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add Custom Token</h4>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Token Contract Address"
                value={newToken.address}
                onChange={(e) => setNewToken(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              />
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Symbol (e.g., USDC)"
                value={newToken.symbol}
                onChange={(e) => setNewToken(prev => ({ ...prev, symbol: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <input
                type="number"
                placeholder="Decimals"
                value={newToken.decimals}
                onChange={(e) => setNewToken(prev => ({ ...prev, decimals: parseInt(e.target.value) || 18 }))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                min="0"
                max="18"
              />
            </div>
            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={handleAddToken}
                disabled={isAdding || !newToken.address || !newToken.symbol}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isAdding ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewToken({ address: '', symbol: '', decimals: 18 });
                  setError('');
                }}
                className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tokens.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No tokens added yet. Click "Add Token" to add custom tokens.
          </p>
        ) : (
          tokens.map((token) => (
            <div key={token.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{token.symbol}</span>
                  <span className="text-xs text-gray-500 font-mono">
                    {token.address.slice(0, 6)}...{token.address.slice(-4)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Balance: {formatBalance(token.balance)}
                </div>
              </div>
              <button
                onClick={() => handleRemoveToken(token.address)}
                className="p-1 text-gray-400 hover:text-red-600"
                title="Remove token"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
