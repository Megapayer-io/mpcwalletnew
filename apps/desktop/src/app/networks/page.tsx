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
      <div className="space-y-4">
        {/* Header Section - Compact */}
        <div className="megapayer-panel p-4 text-megapayer-text relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-megapayer-teal/10 via-megapayer-violet/10 to-megapayer-emerald/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald rounded-lg flex items-center justify-center shadow-md">
                  <CustomIcons.Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold mb-0.5 font-heading text-megapayer-text">Network Management</h1>
                  <p className="text-megapayer-muted text-xs">Manage your blockchain networks</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-megapayer-muted text-xs mb-0.5">Total Networks</p>
                <p className="text-2xl font-bold text-megapayer-text">{networks.length}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <div className="w-2 h-2 bg-megapayer-emerald rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-megapayer-emerald">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Available Networks */}
          <div className="megapayer-panel p-4 animate-fade-in-up rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-megapayer-teal to-megapayer-violet rounded-lg flex items-center justify-center shadow-md">
                  <CustomIcons.Globe className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-megapayer-text font-heading">Available Networks</h2>
                  <p className="text-megapayer-muted text-xs">{networks.length} networks configured</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {networks.map((network, index) => (
                <div
                  key={network.chainId}
                  className={`megapayer-panel-soft p-3 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up ${
                    currentNetwork?.chainId === network.chainId
                      ? 'border-2 border-megapayer-teal/50 bg-gradient-to-r from-megapayer-teal/5 to-megapayer-emerald/5'
                      : 'border border-megapayer-border-soft hover:border-megapayer-border'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                        currentNetwork?.chainId === network.chainId 
                          ? 'bg-gradient-to-br from-megapayer-teal to-megapayer-emerald' 
                          : 'bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel'
                      }`}>
                        <div className={`w-6 h-6 rounded-full ${
                          currentNetwork?.chainId === network.chainId ? 'bg-white' : 'bg-megapayer-muted'
                        }`}></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-megapayer-text text-lg">{network.name}</h3>
                        <p className="text-sm text-megapayer-muted">
                          Chain ID: {network.chainId} • {network.symbol}
                        </p>
                        {network.rpcUrl && (
                          <p className="text-xs text-megapayer-muted font-mono mt-1 truncate max-w-xs">
                            {network.rpcUrl}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {currentNetwork?.chainId === network.chainId && (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-megapayer-emerald/20 text-megapayer-emerald rounded-full">
                          <CustomIcons.CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Active</span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleSelectNetwork(network.chainId)}
                        disabled={currentNetwork?.chainId === network.chainId}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${
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
                          className="p-2 text-megapayer-muted hover:text-megapayer-accent transition-all duration-300 hover:scale-110 hover:bg-megapayer-panel-soft rounded-xl"
                          title="Remove network"
                        >
                          <CustomIcons.Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Custom Network */}
          <div className="megapayer-panel p-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-accent to-megapayer-violet rounded-xl flex items-center justify-center shadow-lg">
                <CustomIcons.Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-megapayer-text font-heading">Add Custom Network</h2>
                <p className="text-megapayer-muted">Configure a new blockchain network</p>
              </div>
            </div>
            
            <NetworkForm />
            
            <div className="mt-8 p-6 megapayer-panel-soft rounded-xl border border-megapayer-border-soft">
              <div className="flex items-start gap-4">
                <CustomIcons.AlertTriangle className="w-5 h-5 text-megapayer-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-megapayer-text mb-2">Important Security Notice</h3>
                  <p className="text-sm text-megapayer-muted">
                    Only add networks you trust. Adding malicious networks could result in loss of funds.
                    Always verify network details before adding them to your wallet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Information */}
        <div className="megapayer-panel p-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-megapayer-violet to-megapayer-teal rounded-xl flex items-center justify-center shadow-lg">
              <CustomIcons.Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-megapayer-text font-heading">Network Information</h2>
              <p className="text-megapayer-muted">Current network details and status</p>
            </div>
          </div>
          
          {currentNetwork ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
                <label className="block text-sm font-semibold text-megapayer-text mb-3">Network Name</label>
                <p className="text-lg font-bold text-megapayer-text">{currentNetwork.name}</p>
              </div>
              <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
                <label className="block text-sm font-semibold text-megapayer-text mb-3">Chain ID</label>
                <p className="text-lg font-bold text-megapayer-text">{currentNetwork.chainId}</p>
              </div>
              <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
                <label className="block text-sm font-semibold text-megapayer-text mb-3">Symbol</label>
                <p className="text-lg font-bold text-megapayer-text">{currentNetwork.symbol}</p>
              </div>
              <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
                <label className="block text-sm font-semibold text-megapayer-text mb-3">RPC URL</label>
                <p className="text-sm font-mono text-megapayer-muted break-all">
                  {currentNetwork.rpcUrl}
                </p>
              </div>
              <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
                <label className="block text-sm font-semibold text-megapayer-text mb-3">Block Explorer</label>
                <p className="text-sm font-mono text-megapayer-muted break-all">
                  {currentNetwork.blockExplorer}
                </p>
              </div>
              <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
                <label className="block text-sm font-semibold text-megapayer-text mb-3">Status</label>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-megapayer-emerald rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-megapayer-emerald">Connected</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CustomIcons.Globe className="w-10 h-10 text-megapayer-muted" />
              </div>
              <h3 className="text-xl font-bold text-megapayer-text mb-3 font-heading">No Network Selected</h3>
              <p className="text-megapayer-muted mb-6">
                Please select a network to view its information.
              </p>
              <p className="text-sm text-megapayer-muted">
                Choose from the available networks above to get started.
              </p>
            </div>
          )}
        </div>
      </div>
  );
}