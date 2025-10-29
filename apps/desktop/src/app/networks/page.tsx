'use client';

import { useWalletStore } from '@/store/wallet';
import { NetworkForm } from '@/components/NetworkForm';
import { CustomIcons } from '@/components/icons/CustomIcons';

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
      <div className="space-y-3">
        {/* Header Section */}
        <div className="megapayer-panel p-2 text-megapayer-text relative overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-megapayer-teal/10 via-megapayer-violet/10 to-megapayer-emerald/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald rounded-lg flex items-center justify-center shadow-md">
                  <CustomIcons.Globe className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold mb-0 font-heading text-megapayer-text">Network Management</h1>
                  <p className="text-megapayer-muted text-xs">Manage your blockchain networks</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-megapayer-muted text-xs mb-0.5">Total Networks</p>
                <p className="text-lg font-bold text-megapayer-text">{networks.length}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-megapayer-emerald rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-megapayer-emerald">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Available Networks */}
          <div className="megapayer-panel p-2 animate-fade-in-up rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-megapayer-teal to-megapayer-violet rounded-lg flex items-center justify-center shadow-md">
                <CustomIcons.Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-megapayer-text font-heading">Available Networks</h2>
                <p className="text-megapayer-muted text-xs">{networks.length} networks configured</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            {networks.map((network, index) => (
              <div
                key={network.chainId}
                className={`megapayer-panel-soft p-2 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up ${
                  currentNetwork?.chainId === network.chainId
                    ? 'border-2 border-megapayer-teal/50 bg-gradient-to-r from-megapayer-teal/5 to-megapayer-emerald/5'
                    : 'border border-megapayer-border-soft hover:border-megapayer-border'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
                      currentNetwork?.chainId === network.chainId 
                        ? 'bg-gradient-to-br from-megapayer-teal to-megapayer-emerald' 
                        : 'bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel'
                    }`}>
                      <div className={`w-4 h-4 rounded-full ${
                        currentNetwork?.chainId === network.chainId ? 'bg-white' : 'bg-megapayer-muted'
                      }`}></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-megapayer-text text-xs">{network.name}</h3>
                      <p className="text-xs text-megapayer-muted">
                        Chain ID: {network.chainId} • {network.symbol}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1.5">
                    {currentNetwork?.chainId === network.chainId && (
                      <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-megapayer-emerald/20 text-megapayer-emerald rounded-full">
                        <CustomIcons.CheckCircle className="w-3 h-3" />
                        <span className="text-xs font-medium">Active</span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleSelectNetwork(network.chainId)}
                      disabled={currentNetwork?.chainId === network.chainId}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-105 ${
                        currentNetwork?.chainId === network.chainId
                          ? 'bg-megapayer-panel-soft text-megapayer-muted cursor-not-allowed'
                          : 'megapayer-btn-primary'
                      }`}
                    >
                      {currentNetwork?.chainId === network.chainId ? 'Selected' : 'Select'}
                    </button>
                    
                    {network.chainId !== 1 && network.chainId !== 137 && network.chainId !== 56 && (
                      <button
                        onClick={() => handleRemoveNetwork(network.chainId)}
                        className="p-1 text-megapayer-muted hover:text-megapayer-accent transition-all duration-300 hover:scale-110 hover:bg-megapayer-panel-soft rounded-lg"
                        title="Remove network"
                      >
                        <CustomIcons.Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Custom Network */}
        <div className="megapayer-panel p-2 animate-fade-in-up rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-megapayer-accent to-megapayer-violet rounded-lg flex items-center justify-center shadow-md">
              <CustomIcons.Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-megapayer-text font-heading">Add Custom Network</h2>
              <p className="text-megapayer-muted text-xs">Configure a new blockchain network</p>
            </div>
          </div>
          
          <NetworkForm />
        </div>
        </div>
      </div>
  );
}