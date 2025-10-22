'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { Layout } from '@/components/layout/Layout';
import { SendForm } from '@/components/SendForm';
import { Send, AlertCircle, RefreshCw, ChevronDown, Info } from 'lucide-react';

interface Token {
  address: string;
  symbol: string;
  decimals: number;
  name?: string;
}

export default function SendPage() {
  const router = useRouter();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { isUnlocked, currentNetwork, getBalance } = useWalletStore();

  // Redirect to unlock page if wallet is locked
  useEffect(() => {
    if (!isUnlocked) {
      router.push('/unlock');
    }
  }, [isUnlocked, router]);

  useEffect(() => {
    loadCustomTokens();
  }, []);

  const loadCustomTokens = () => {
    try {
      const saved = localStorage.getItem('mpc-wallet-tokens');
      if (saved) {
        const tokens = JSON.parse(saved);
        setCustomTokens(tokens);
        
        // Set default to native token if no token selected
        if (!selectedToken) {
          setSelectedToken({
            address: '',
            symbol: currentNetwork?.symbol || 'ETH',
            decimals: 18,
            name: currentNetwork?.name || 'Ethereum'
          });
        }
      } else {
        // Set default to native token
        setSelectedToken({
          address: '',
          symbol: currentNetwork?.symbol || 'ETH',
          decimals: 18,
          name: currentNetwork?.name || 'Ethereum'
        });
      }
    } catch (error) {
      console.error('Failed to load custom tokens:', error);
    }
  };

  // Show loading while redirecting
  if (!isUnlocked) {
    return (
      <Layout title="Send Funds" subtitle="Transfer tokens to any address">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting to unlock page...</h1>
          <p className="text-gray-600">
            Please wait while we redirect you to unlock your wallet.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Send Funds" subtitle="Transfer tokens to any address">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Token Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Select Token</h2>
            <button
              onClick={loadCustomTokens}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
            <p className="text-sm text-gray-500 mt-3">
              No custom tokens added yet. Go to Dashboard to add custom tokens.
            </p>
          )}
        </div>

        {/* Send Form */}
        {selectedToken && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <SendForm 
              selectedToken={selectedToken}
              onTokenChange={setSelectedToken}
            />
          </div>
        )}

        {/* Transaction Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Transaction Information</h3>
              <div className="text-blue-800 text-sm space-y-2">
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
      </div>
    </Layout>
  );
}