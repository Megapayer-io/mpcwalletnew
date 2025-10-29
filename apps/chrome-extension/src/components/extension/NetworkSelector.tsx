'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { ChevronDown, Globe, Check } from 'lucide-react';

export function NetworkSelector() {
  const { currentNetwork, switchNetwork } = useWalletStore();
  const [isOpen, setIsOpen] = useState(false);

  const networks = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      chainId: 1,
      symbol: 'ETH',
      color: 'bg-blue-500'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      chainId: 137,
      symbol: 'MATIC',
      color: 'bg-purple-500'
    },
    {
      id: 'bsc',
      name: 'BSC',
      chainId: 56,
      symbol: 'BNB',
      color: 'bg-yellow-500'
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      chainId: 42161,
      symbol: 'ETH',
      color: 'bg-blue-600'
    }
  ];

  const handleNetworkChange = (networkId: string) => {
    switchNetwork(networkId);
    setIsOpen(false);
  };

  return (
    <div className="wallet-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Network</h3>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={`w-3 h-3 rounded-full ${currentNetwork?.color || 'bg-gray-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {currentNetwork?.name || 'Select Network'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-2">
                {networks.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => handleNetworkChange(network.id)}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full ${network.color}`}></div>
                    <span className="flex-1 text-left">{network.name}</span>
                    {currentNetwork?.id === network.id && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {currentNetwork && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Globe className="w-4 h-4" />
          <span>Chain ID: {currentNetwork.chainId}</span>
        </div>
      )}
    </div>
  );
}
