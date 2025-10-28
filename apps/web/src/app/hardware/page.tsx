'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Layout } from '@/components/layout/Layout';
import { CustomIcons } from '@/components/icons/CustomIcons';

interface HardwareWallet {
  type: 'ledger' | 'trezor' | 'keepkey' | 'bitbox';
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  accounts: string[];
}

export default function HardwareWalletPage() {
  const {
    address,
    isUnlocked,
    currentNetwork
  } = useWalletStore();
  
  const [hardwareWallets, setHardwareWallets] = useState<HardwareWallet[]>([
    {
      type: 'ledger',
      name: 'Ledger Nano S/X',
      description: 'Hardware security for your crypto',
      status: 'disconnected',
      accounts: []
    },
    {
      type: 'trezor',
      name: 'Trezor One/Model T',
      description: 'The original hardware wallet',
      status: 'disconnected',
      accounts: []
    },
    {
      type: 'keepkey',
      name: 'KeepKey',
      description: 'Large display hardware wallet',
      status: 'disconnected',
      accounts: []
    },
    {
      type: 'bitbox',
      name: 'BitBox02',
      description: 'Swiss-made hardware wallet',
      status: 'disconnected',
      accounts: []
    }
  ]);
  
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<HardwareWallet | null>(null);

  const handleConnect = async (walletType: string) => {
    setIsConnecting(walletType);
    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setHardwareWallets(prev => prev.map(wallet => 
        wallet.type === walletType 
          ? { ...wallet, status: 'connected', accounts: ['0x1234...5678', '0x8765...4321'] }
          : wallet
      ));
    } catch (error) {
      setHardwareWallets(prev => prev.map(wallet => 
        wallet.type === walletType 
          ? { ...wallet, status: 'error' }
          : wallet
      ));
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = (walletType: string) => {
    setHardwareWallets(prev => prev.map(wallet => 
      wallet.type === walletType 
        ? { ...wallet, status: 'disconnected', accounts: [] }
        : wallet
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CustomIcons.CheckCircle className="h-4 w-4" />;
      case 'disconnected': return <CustomIcons.Lock className="h-4 w-4" />;
      case 'error': return <CustomIcons.AlertTriangle className="h-4 w-4" />;
      default: return <CustomIcons.Lock className="h-4 w-4" />;
    }
  };

  if (!isUnlocked) {
    return (
      <Layout title="Hardware Wallet">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-megapayer-teal via-megapayer-violet to-megapayer-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CustomIcons.Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-megapayer-text mb-2 font-heading">Wallet Locked</h1>
          <p className="text-megapayer-muted">
            Please unlock your wallet to access hardware wallet features.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Hardware Wallet">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="megapayer-panel p-8 text-megapayer-text relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-megapayer-accent/10 via-megapayer-violet/10 to-megapayer-teal/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-megapayer-accent to-megapayer-violet rounded-2xl flex items-center justify-center shadow-lg">
                <CustomIcons.Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 font-heading text-megapayer-text">Hardware Wallet</h1>
                <p className="text-megapayer-muted text-lg">Connect and manage hardware wallets securely</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-megapayer-accent/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-megapayer-violet/5 rounded-full"></div>
        </div>

        {/* Hardware Wallet Overview */}
        <div className="megapayer-panel p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald rounded-xl flex items-center justify-center shadow-lg">
              <CustomIcons.Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-megapayer-text font-heading">Hardware Wallet Security</h2>
              <p className="text-megapayer-muted">Enhanced security for your crypto assets</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
              <div className="flex items-start gap-3">
                <CustomIcons.CheckCircle className="h-5 w-5 text-megapayer-emerald mt-0.5" />
                <div>
                  <h3 className="font-semibold text-megapayer-text">Enhanced Security</h3>
                  <p className="text-sm text-megapayer-muted mt-1">
                    Hardware wallets keep your private keys offline, providing the highest level of security for your crypto assets.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
              <div className="flex items-start gap-3">
                <CustomIcons.Key className="h-5 w-5 text-megapayer-teal mt-0.5" />
                <div>
                  <h3 className="font-semibold text-megapayer-text">Easy Integration</h3>
                  <p className="text-sm text-megapayer-muted mt-1">
                    Connect your hardware wallet to sign transactions securely without exposing your private keys.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Wallet List */}
        <div className="megapayer-panel p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-megapayer-violet to-megapayer-teal rounded-xl flex items-center justify-center shadow-lg">
              <CustomIcons.Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-megapayer-text font-heading">Supported Hardware Wallets</h2>
              <p className="text-megapayer-muted">Connect your hardware wallet for enhanced security</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hardwareWallets.map((wallet, index) => (
              <div
                key={wallet.type}
                className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft hover:border-megapayer-teal/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-megapayer-accent to-megapayer-violet rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      {wallet.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-megapayer-text">{wallet.name}</h3>
                      <p className="text-sm text-megapayer-muted">{wallet.description}</p>
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(wallet.status)}`}>
                    {getStatusIcon(wallet.status)}
                    {wallet.status}
                  </span>
                </div>
                
                {wallet.status === 'connected' && wallet.accounts.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-megapayer-text mb-2">Connected Accounts</h4>
                    <div className="space-y-2">
                      {wallet.accounts.map((account, i) => (
                        <div key={i} className="flex items-center justify-between p-3 megapayer-panel rounded-lg">
                          <span className="text-sm font-mono text-megapayer-text">{account}</span>
                          <button className="p-1 rounded hover:bg-megapayer-panel-soft text-megapayer-muted transition-colors">
                            <CustomIcons.ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  {wallet.status === 'disconnected' ? (
                    <button
                      onClick={() => handleConnect(wallet.type)}
                      disabled={isConnecting === wallet.type}
                      className="megapayer-btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConnecting === wallet.type ? (
                        <CustomIcons.Refresh className="h-4 w-4 animate-spin" />
                      ) : (
                        <CustomIcons.Key className="h-4 w-4" />
                      )}
                      {isConnecting === wallet.type ? 'Connecting...' : 'Connect'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDisconnect(wallet.type)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-megapayer-muted text-white rounded-xl hover:bg-megapayer-muted/80 transition-all duration-300"
                    >
                      <CustomIcons.Lock className="h-4 w-4" />
                      Disconnect
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedWallet(wallet)}
                    className="px-4 py-2 border border-megapayer-border text-megapayer-text rounded-xl hover:bg-megapayer-panel-soft transition-all duration-300"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="megapayer-panel p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-megapayer-emerald to-megapayer-teal rounded-xl flex items-center justify-center shadow-lg">
              <CustomIcons.Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-megapayer-text font-heading">Setup Instructions</h2>
              <p className="text-megapayer-muted">Follow these steps to connect your hardware wallet</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">1</div>
                <div>
                  <h3 className="font-semibold text-megapayer-text">Install Browser Extension</h3>
                  <p className="text-sm text-megapayer-muted mt-1">
                    Make sure you have the official browser extension for your hardware wallet installed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-megapayer-emerald to-megapayer-teal text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">2</div>
                <div>
                  <h3 className="font-semibold text-megapayer-text">Connect Your Device</h3>
                  <p className="text-sm text-megapayer-muted mt-1">
                    Connect your hardware wallet via USB and unlock it with your PIN.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-megapayer-violet to-megapayer-accent text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">3</div>
                <div>
                  <h3 className="font-semibold text-megapayer-text">Authorize Connection</h3>
                  <p className="text-sm text-megapayer-muted mt-1">
                    Click "Connect" above and authorize the connection on your hardware wallet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
