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
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label htmlFor="chainId" className="block text-xs font-semibold text-megapayer-text mb-1">
            Chain ID *
          </label>
          <input
            type="number"
            id="chainId"
            name="chainId"
            value={formData.chainId}
            onChange={handleInputChange}
            className="w-full px-2 py-1.5 megapayer-panel-soft border border-megapayer-border rounded-lg focus:outline-none focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-xs text-megapayer-text placeholder-megapayer-muted"
            placeholder="e.g., 1 for Ethereum Mainnet"
            required
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-megapayer-text mb-1">
            Network Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-2 py-1.5 megapayer-panel-soft border border-megapayer-border rounded-lg focus:outline-none focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-xs text-megapayer-text placeholder-megapayer-muted"
            placeholder="e.g., Ethereum Mainnet"
            required
          />
        </div>

        <div>
          <label htmlFor="rpcUrl" className="block text-xs font-semibold text-megapayer-text mb-1">
            RPC URL *
          </label>
          <input
            type="url"
            id="rpcUrl"
            name="rpcUrl"
            value={formData.rpcUrl}
            onChange={handleInputChange}
            className="w-full px-2 py-1.5 megapayer-panel-soft border border-megapayer-border rounded-lg focus:outline-none focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-xs text-megapayer-text placeholder-megapayer-muted"
            placeholder="https://eth.llamarpc.com"
            required
          />
        </div>

        <div>
          <label htmlFor="symbol" className="block text-xs font-semibold text-megapayer-text mb-1">
            Currency Symbol *
          </label>
          <input
            type="text"
            id="symbol"
            name="symbol"
            value={formData.symbol}
            onChange={handleInputChange}
            className="w-full px-2 py-1.5 megapayer-panel-soft border border-megapayer-border rounded-lg focus:outline-none focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-xs text-megapayer-text placeholder-megapayer-muted"
            placeholder="e.g., ETH"
            required
          />
        </div>

        <div>
          <label htmlFor="blockExplorer" className="block text-xs font-semibold text-megapayer-text mb-1">
            Block Explorer URL (optional)
          </label>
          <input
            type="url"
            id="blockExplorer"
            name="blockExplorer"
            value={formData.blockExplorer}
            onChange={handleInputChange}
            className="w-full px-2 py-1.5 megapayer-panel-soft border border-megapayer-border rounded-lg focus:outline-none focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-xs text-megapayer-text placeholder-megapayer-muted"
            placeholder="https://etherscan.io"
          />
        </div>

        {(error || validationError) && (
          <div className="p-2 megapayer-panel-soft border border-red-400/30 rounded-lg">
            <div className="flex items-center space-x-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-red-600" />
              <p className="text-xs text-red-600">{error || validationError}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isValidating || !formData.chainId || !formData.name || !formData.rpcUrl || !formData.symbol}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 megapayer-btn-primary rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{isValidating ? 'Validating...' : 'Add Network'}</span>
        </button>
      </form>
    </div>
  );
}
