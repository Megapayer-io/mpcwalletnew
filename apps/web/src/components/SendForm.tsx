'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Send, AlertCircle, ExternalLink } from 'lucide-react';

interface SendFormProps {
  type: 'eth' | 'token';
  tokenAddress?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

export function SendForm({ type, tokenAddress, tokenSymbol, tokenDecimals = 18 }: SendFormProps) {
  const [formData, setFormData] = useState({
    to: '',
    amount: '',
    tokenAddress: tokenAddress || ''
  });
  const [txHash, setTxHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { sendEth, sendErc20, currentNetwork, error, clearError } = useWalletStore();

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

      if (type === 'eth') {
        hash = await sendEth({
          to: formData.to,
          valueEth: formData.amount
        });
      } else {
        if (!tokenAddress) {
          throw new Error('Token address is required');
        }
        hash = await sendErc20({
          tokenAddress,
          to: formData.to,
          amount: formData.amount,
          decimals: tokenDecimals
        });
      }

      setTxHash(hash);
      setFormData({
        to: '',
        amount: '',
        tokenAddress: tokenAddress || ''
      });
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
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Send {type === 'eth' ? currentNetwork?.symbol || 'ETH' : tokenSymbol || 'Token'}
        </h2>
        
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

          {type === 'token' && !tokenAddress && (
            <div>
              <label htmlFor="tokenAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Token Contract Address *
              </label>
              <input
                type="text"
                id="tokenAddress"
                name="tokenAddress"
                value={formData.tokenAddress}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="0x..."
                required
              />
            </div>
          )}

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
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {type === 'eth' ? currentNetwork?.symbol || 'ETH' : tokenSymbol || 'Token'} amount
            </p>
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
            disabled={isLoading || !formData.to || !formData.amount}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>{isLoading ? 'Sending...' : 'Send Transaction'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
