'use client';

import { useWalletStore } from '@/store/wallet';
import { Layout } from '@/components/layout/Layout';
import { NetworkForm } from '@/components/NetworkForm';
import { Trash2, Check, AlertCircle, Plus, Globe } from 'lucide-react';

export default function NetworksPage() {
  const { networks, selectNetwork, currentNetwork } = useWalletStore();

  const handleSelectNetwork = (chainId: number) => {
    selectNetwork(chainId);
  };

  const handleRemoveNetwork = (chainId: number) => {
    // Note: In a real implementation, you'd want to add a removeNetwork function to the store
    // For now, we'll just show an alert
    alert('Network removal not implemented in this demo');
  };

  return (
    <Layout title="Networks" subtitle="Manage your blockchain networks and add custom ones">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Networks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Available Networks</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Globe className="w-4 h-4" />
                <span>{networks.length} networks</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {networks.map((network) => (
                <div
                  key={network.chainId}
                  className={`p-4 border rounded-lg transition-all duration-200 ${
                    currentNetwork?.chainId === network.chainId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        currentNetwork?.chainId === network.chainId ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <h3 className="font-medium text-gray-900">{network.name}</h3>
                        <p className="text-sm text-gray-500">
                          Chain ID: {network.chainId} • {network.symbol}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {currentNetwork?.chainId === network.chainId && (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">Active</span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleSelectNetwork(network.chainId)}
                        disabled={currentNetwork?.chainId === network.chainId}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          currentNetwork?.chainId === network.chainId
                            ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {currentNetwork?.chainId === network.chainId ? 'Selected' : 'Select'}
                      </button>
                      
                      {network.chainId !== 1 && network.chainId !== 137 && network.chainId !== 56 && (
                        <button
                          onClick={() => handleRemoveNetwork(network.chainId)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove network"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {network.rpcUrl && (
                    <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                      RPC: {network.rpcUrl}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Custom Network */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Plus className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Add Custom Network</h2>
            </div>
            
            <NetworkForm />
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 mb-1">Important Notice</h3>
                  <p className="text-sm text-yellow-700">
                    Only add networks you trust. Adding malicious networks could result in loss of funds.
                    Always verify network details before adding them to your wallet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Network Information</h2>
          
          {currentNetwork ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Network Name</label>
                <p className="text-gray-900">{currentNetwork.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chain ID</label>
                <p className="text-gray-900">{currentNetwork.chainId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                <p className="text-gray-900">{currentNetwork.symbol}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RPC URL</label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                  {currentNetwork.rpcUrl}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Block Explorer</label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                  {currentNetwork.blockExplorer}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Connected</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Network Selected</h3>
              <p className="text-gray-600">Please select a network to view its information.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}