'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Plus, AlertCircle } from 'lucide-react';

export function NetworkForm() {
  const [formData, setFormData] = useState({
    chainId: '',
    name: '',
    rpcUrl: '',
    symbol: '',
    blockExplorer: ''
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { addNetwork, error, clearError } = useWalletStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
    setValidationError('');
  };

  const validateRpcUrl = async (url: string) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1
        })
      });

      if (!response.ok) {
        throw new Error('RPC URL is not accessible');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error('RPC returned an error');
      }

      const chainId = parseInt(data.result, 16);
      return chainId;
    } catch (error) {
      throw new Error('Invalid or inaccessible RPC URL');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setValidationError('');

    try {
      // Validate chain ID
      const chainId = parseInt(formData.chainId);
      if (isNaN(chainId) || chainId <= 0) {
        throw new Error('Chain ID must be a positive number');
      }

      // Validate RPC URL
      const actualChainId = await validateRpcUrl(formData.rpcUrl);
      if (actualChainId !== chainId) {
        throw new Error(`Chain ID mismatch. Expected ${chainId}, but RPC returned ${actualChainId}`);
      }

      // Add network
      addNetwork({
        chainId,
        name: formData.name,
        rpcUrl: formData.rpcUrl,
        symbol: formData.symbol,
        blockExplorer: formData.blockExplorer || undefined
      });

      // Reset form
      setFormData({
        chainId: '',
        name: '',
        rpcUrl: '',
        symbol: '',
        blockExplorer: ''
      });
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Custom Network</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="chainId" className="block text-sm font-medium text-gray-700 mb-1">
              Chain ID *
            </label>
            <input
              type="number"
              id="chainId"
              name="chainId"
              value={formData.chainId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 1 for Ethereum Mainnet"
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Network Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Ethereum Mainnet"
              required
            />
          </div>

          <div>
            <label htmlFor="rpcUrl" className="block text-sm font-medium text-gray-700 mb-1">
              RPC URL *
            </label>
            <input
              type="url"
              id="rpcUrl"
              name="rpcUrl"
              value={formData.rpcUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://eth.llamarpc.com"
              required
            />
          </div>

          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
              Currency Symbol *
            </label>
            <input
              type="text"
              id="symbol"
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., ETH"
              required
            />
          </div>

          <div>
            <label htmlFor="blockExplorer" className="block text-sm font-medium text-gray-700 mb-1">
              Block Explorer URL (optional)
            </label>
            <input
              type="url"
              id="blockExplorer"
              name="blockExplorer"
              value={formData.blockExplorer}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://etherscan.io"
            />
          </div>

          {(error || validationError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">{error || validationError}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isValidating || !formData.chainId || !formData.name || !formData.rpcUrl || !formData.symbol}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>{isValidating ? 'Validating...' : 'Add Network'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
