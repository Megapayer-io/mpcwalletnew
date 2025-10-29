'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';

export function NetworkManager() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<any>(null);
  const [newNetwork, setNewNetwork] = useState({
    name: '',
    rpcUrl: '',
    chainId: '',
    symbol: '',
    explorerUrl: ''
  });
  const [error, setError] = useState('');

  const { currentNetwork, addCustomNetwork, removeCustomNetwork } = useWalletStore();

  const defaultNetworks = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      chainId: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/',
      symbol: 'ETH',
      explorerUrl: 'https://etherscan.io',
      isDefault: true
    },
    {
      id: 'polygon',
      name: 'Polygon',
      chainId: 137,
      rpcUrl: 'https://polygon-rpc.com',
      symbol: 'MATIC',
      explorerUrl: 'https://polygonscan.com',
      isDefault: true
    },
    {
      id: 'bsc',
      name: 'BSC',
      chainId: 56,
      rpcUrl: 'https://bsc-dataseed.binance.org',
      symbol: 'BNB',
      explorerUrl: 'https://bscscan.com',
      isDefault: true
    }
  ];

  const handleAddNetwork = () => {
    if (!newNetwork.name || !newNetwork.rpcUrl || !newNetwork.chainId) {
      setError('Name, RPC URL, and Chain ID are required');
      return;
    }

    try {
      const network = {
        id: `custom-${Date.now()}`,
        name: newNetwork.name,
        chainId: parseInt(newNetwork.chainId),
        rpcUrl: newNetwork.rpcUrl,
        symbol: newNetwork.symbol || 'ETH',
        explorerUrl: newNetwork.explorerUrl,
        isDefault: false
      };

      addCustomNetwork(network);
      setNewNetwork({
        name: '',
        rpcUrl: '',
        chainId: '',
        symbol: '',
        explorerUrl: ''
      });
      setShowAddForm(false);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add network');
    }
  };

  const handleRemoveNetwork = (networkId: string) => {
    if (confirm('Are you sure you want to remove this network?')) {
      try {
        removeCustomNetwork(networkId);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to remove network');
      }
    }
  };

  const handleEditNetwork = (network: any) => {
    setEditingNetwork(network);
    setNewNetwork({
      name: network.name,
      rpcUrl: network.rpcUrl,
      chainId: network.chainId.toString(),
      symbol: network.symbol,
      explorerUrl: network.explorerUrl
    });
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Network Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Network</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Networks List */}
      <div className="space-y-3">
        {defaultNetworks.map((network) => (
          <div
            key={network.id}
            className={`p-4 border rounded-lg ${
              currentNetwork?.id === network.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-gray-900">{network.name}</h3>
                  {currentNetwork?.id === network.id && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                      Active
                    </span>
                  )}
                  {network.isDefault && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Chain ID: {network.chainId}</p>
                  <p className="font-mono text-xs">{network.rpcUrl}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!network.isDefault && (
                  <>
                    <button
                      onClick={() => handleEditNetwork(network)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit network"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveNetwork(network.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Remove network"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Network Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingNetwork ? 'Edit Network' : 'Add Custom Network'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Network Name *
                </label>
                <input
                  type="text"
                  value={newNetwork.name}
                  onChange={(e) => setNewNetwork(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ethereum"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RPC URL *
                </label>
                <input
                  type="url"
                  value={newNetwork.rpcUrl}
                  onChange={(e) => setNewNetwork(prev => ({ ...prev, rpcUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://mainnet.infura.io/v3/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chain ID *
                  </label>
                  <input
                    type="number"
                    value={newNetwork.chainId}
                    onChange={(e) => setNewNetwork(prev => ({ ...prev, chainId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={newNetwork.symbol}
                    onChange={(e) => setNewNetwork(prev => ({ ...prev, symbol: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ETH"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Explorer URL
                </label>
                <input
                  type="url"
                  value={newNetwork.explorerUrl}
                  onChange={(e) => setNewNetwork(prev => ({ ...prev, explorerUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://etherscan.io"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingNetwork(null);
                    setNewNetwork({
                      name: '',
                      rpcUrl: '',
                      chainId: '',
                      symbol: '',
                      explorerUrl: ''
                    });
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNetwork}
                  disabled={!newNetwork.name || !newNetwork.rpcUrl || !newNetwork.chainId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingNetwork ? 'Update' : 'Add'} Network
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
