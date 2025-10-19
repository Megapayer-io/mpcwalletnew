'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Header } from '@/components/Header';
import { SendForm } from '@/components/SendForm';
import { Send, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';

interface Token {
  address: string;
  symbol: string;
  decimals: number;
  name?: string;
}

export default function SendPage() {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { isUnlocked, currentNetwork, getBalance } = useWalletStore();

  // Load custom tokens and set default selection
  useEffect(() => {
    if (isUnlocked) {
      loadCustomTokens();
      // Set default to native token
      setSelectedToken({
        address: '',
        symbol: currentNetwork?.symbol || 'ETH',
        decimals: 18,
        name: currentNetwork?.name || 'Ethereum'
      });
    }
  }, [isUnlocked, currentNetwork]);

  const loadCustomTokens = () => {
    const stored = localStorage.getItem('mpc-wallet-tokens');
    if (stored) {
      try {
        const tokens = JSON.parse(stored);
        setCustomTokens(tokens);
      } catch (error) {
        console.error('Failed to load custom tokens:', error);
      }
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Wallet Locked</h1>
            <p className="text-gray-600">
              Please unlock your wallet to send transactions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Transaction</h1>
          <p className="text-gray-600">Send native tokens or ERC-20 tokens</p>
        </div>

        {/* Token Selection */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Token to Send</h3>
            <button
              onClick={loadCustomTokens}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Refresh token list"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          
          <div className="relative">
            <select
              value={selectedToken ? `${selectedToken.address}-${selectedToken.symbol}` : ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'native') {
                  setSelectedToken({
                    address: '',
                    symbol: currentNetwork?.symbol || 'ETH',
                    decimals: 18,
                    name: currentNetwork?.name || 'Ethereum'
                  });
                } else {
                  const [address, symbol] = value.split('-');
                  const token = customTokens.find(t => t.address === address && t.symbol === symbol);
                  if (token) {
                    setSelectedToken(token);
                  }
                }
              }}
              className="w-full appearance-none bg-white border border-gray-300 rounded-md px-4 py-3 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="native">
                {currentNetwork?.symbol || 'ETH'} - {currentNetwork?.name || 'Ethereum'} (Native)
              </option>
              {customTokens.map((token) => (
                <option key={`${token.address}-${token.symbol}`} value={`${token.address}-${token.symbol}`}>
                  {token.symbol} - {token.name || 'Custom Token'}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          
          {customTokens.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No custom tokens added yet. Go to Dashboard to add custom tokens.
            </p>
          )}
        </div>

        {/* Send Form */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {selectedToken && (
            <SendForm 
              selectedToken={selectedToken}
              onTokenChange={setSelectedToken}
            />
          )}
        </div>

        {/* Transaction Information */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Transaction Information</h3>
          <div className="text-yellow-800 text-sm space-y-2">
            <p>
              <strong>Current Network:</strong> {currentNetwork?.name} (Chain ID: {currentNetwork?.chainId})
            </p>
            <p>
              <strong>Gas Fees:</strong> Gas fees are automatically estimated and included in your transaction.
            </p>
            <p>
              <strong>Security:</strong> Always verify the recipient address and amount before sending.
              Transactions cannot be reversed once confirmed on the blockchain.
            </p>
            {currentNetwork?.blockExplorer && (
              <p>
                <strong>Explorer:</strong> View your transactions on{' '}
                <a
                  href={currentNetwork.blockExplorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  {currentNetwork.blockExplorer}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
