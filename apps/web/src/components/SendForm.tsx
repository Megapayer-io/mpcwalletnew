'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Send, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface Token {
  address: string;
  symbol: string;
  decimals: number;
  name?: string;
}

interface SendFormProps {
  selectedToken: Token;
  onTokenChange: (token: Token) => void;
}

export function SendForm({ selectedToken, onTokenChange }: SendFormProps) {
  const [formData, setFormData] = useState({
    to: '',
    amount: ''
  });
  const [txHash, setTxHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  const { sendEth, sendErc20, getBalance, getTokenBalance, currentNetwork, error, clearError } = useWalletStore();

  // Load balance when selected token changes
  useEffect(() => {
    loadBalance();
  }, [selectedToken]);

  const loadBalance = async () => {
    setIsLoadingBalance(true);
    try {
      if (selectedToken.address === '') {
        // Native token
        const balance = await getBalance();
        setCurrentBalance(balance);
      } else {
        // ERC-20 token
        const balance = await getTokenBalance({
          tokenAddress: selectedToken.address,
          decimals: selectedToken.decimals
        });
        setCurrentBalance(balance);
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
      setCurrentBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    const balance = parseFloat(currentBalance);
    if (balance > 0) {
      const amount = (balance * percentage / 100).toString();
      setFormData(prev => ({
        ...prev,
        amount: amount
      }));
      clearError();
      setTxHash('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
    setTxHash('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      let hash: string;

      if (selectedToken.address === '') {
        // Native token
        hash = await sendEth({
          to: formData.to,
          valueEth: formData.amount
        });
      } else {
        // ERC-20 token
        hash = await sendErc20({
          tokenAddress: selectedToken.address,
          to: formData.to,
          amount: formData.amount,
          decimals: selectedToken.decimals
        });
      }

      setTxHash(hash);
      setFormData({
        to: '',
        amount: ''
      });
      // Reload balance after successful transaction
      loadBalance();
    } catch (error) {
      // Error is handled by the store
    } finally {
      setIsLoading(false);
    }
  };

  const getExplorerUrl = (hash: string) => {
    if (!currentNetwork?.blockExplorer) return undefined;
    return `${currentNetwork.blockExplorer}/tx/${hash}`;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Send {selectedToken.symbol}
      </h2>
        
        {/* Current Balance Display */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Current Balance</h3>
              <p className="text-2xl font-bold text-gray-900">
                {isLoadingBalance ? (
                  <span className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </span>
                ) : (
                  `${parseFloat(currentBalance).toFixed(6)} ${selectedToken.symbol}`
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={loadBalance}
              disabled={isLoadingBalance}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Refresh balance"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Address *
            </label>
            <input
              type="text"
              id="to"
              name="to"
              value={formData.to}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="0x..."
              required
            />
          </div>


          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.0"
              step="any"
              min="0"
              max={currentBalance}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {selectedToken.symbol} amount
            </p>
            {formData.amount && parseFloat(formData.amount) > parseFloat(currentBalance) && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Amount exceeds available balance
              </p>
            )}
            
            {/* Percentage Buttons */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Quick select:</p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handlePercentageClick(25)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageClick(50)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageClick(75)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  75%
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentageClick(100)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors font-medium"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {txHash && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-green-600">Transaction sent successfully!</p>
                </div>
                {getExplorerUrl(txHash) && (
                  <a
                    href={getExplorerUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700"
                  >
                    <span>View on Explorer</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="text-xs text-green-600 mt-1 font-mono">{txHash}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !formData.to || !formData.amount || parseFloat(formData.amount) > parseFloat(currentBalance)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>{isLoading ? 'Sending...' : 'Send Transaction'}</span>
          </button>
        </form>
    </div>
  );
}
