'use client';

import { useWalletStore } from '@/store/wallet';
import { Header } from '@/components/Header';
import { NetworkForm } from '@/components/NetworkForm';
import { Trash2, Check, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Networks</h1>
          <p className="text-gray-600">Manage your blockchain networks and add custom ones</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Networks */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Networks</h2>
            <div className="space-y-3">
              {networks.map((network) => (
                <div
                  key={network.chainId}
                  className={`p-4 border rounded-lg ${
                    currentNetwork?.chainId === network.chainId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{network.name}</h3>
                        {currentNetwork?.chainId === network.chainId && (
                          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                            <Check className="h-3 w-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Chain ID: {network.chainId}</div>
                        <div>Symbol: {network.symbol}</div>
                        <div className="font-mono text-xs break-all">
                          RPC: {network.rpcUrl}
                        </div>
                        {network.blockExplorer && (
                          <div className="font-mono text-xs break-all">
                            Explorer: {network.blockExplorer}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {currentNetwork?.chainId !== network.chainId && (
                        <button
                          onClick={() => handleSelectNetwork(network.chainId)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Select
                        </button>
                      )}
                      {/* Only allow removal of custom networks (not default ones) */}
                      {network.chainId > 1000000 && (
                        <button
                          onClick={() => handleRemoveNetwork(network.chainId)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Remove network"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {networks.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No networks available</p>
              </div>
            )}
          </div>

          {/* Add Network Form */}
          <div>
            <NetworkForm />
          </div>
        </div>

        {/* Network Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About Networks</h3>
          <div className="text-blue-800 text-sm space-y-2">
            <p>
              Networks represent different blockchain environments. Each network has its own:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Chain ID:</strong> Unique identifier for the network</li>
              <li><strong>RPC URL:</strong> Endpoint to communicate with the blockchain</li>
              <li><strong>Currency Symbol:</strong> Native token symbol (ETH, BNB, etc.)</li>
              <li><strong>Block Explorer:</strong> URL to view transactions and addresses</li>
            </ul>
            <p className="mt-3">
              <strong>Security Note:</strong> Only add networks from trusted sources. 
              Malicious networks could compromise your funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
