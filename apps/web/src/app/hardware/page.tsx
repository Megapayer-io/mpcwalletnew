'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Layout } from '@/components/layout/Layout';
import { 
  Shield, 
  Key, 
  Check, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Zap,
  Lock,
  Unlock
} from 'lucide-react';
import { motion } from 'framer-motion';

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
      case 'connected': return <Check className="h-4 w-4" />;
      case 'disconnected': return <Lock className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  if (!isUnlocked) {
    return (
      <Layout title="Hardware Wallet" subtitle="Connect and manage hardware wallets">
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-fade-in" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in-up">Wallet Locked</h1>
          <p className="text-gray-600 animate-fade-in-up delay-100">
            Please unlock your wallet to access hardware wallet features.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Hardware Wallet" subtitle="Connect and manage hardware wallets">
      <div className="space-y-8 animate-fade-in-up">
        {/* Hardware Wallet Overview */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-scale-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Hardware Wallet Security</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800">Enhanced Security</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Hardware wallets keep your private keys offline, providing the highest level of security for your crypto assets.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Easy Integration</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Connect your hardware wallet to sign transactions securely without exposing your private keys.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hardware Wallet List */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-scale-in delay-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Key className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Supported Hardware Wallets</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hardwareWallets.map((wallet, index) => (
              <motion.div
                key={wallet.type}
                className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {wallet.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{wallet.name}</h3>
                      <p className="text-sm text-gray-600">{wallet.description}</p>
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(wallet.status)}`}>
                    {getStatusIcon(wallet.status)}
                    {wallet.status}
                  </span>
                </div>
                
                {wallet.status === 'connected' && wallet.accounts.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Connected Accounts</h4>
                    <div className="space-y-2">
                      {wallet.accounts.map((account, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm font-mono text-gray-600">{account}</span>
                          <button className="p-1 rounded hover:bg-gray-200 text-gray-600 transition-colors">
                            <ExternalLink className="h-3 w-3" />
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
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isConnecting === wallet.type ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Unlock className="h-4 w-4" />
                      )}
                      {isConnecting === wallet.type ? 'Connecting...' : 'Connect'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDisconnect(wallet.type)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Lock className="h-4 w-4" />
                      Disconnect
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedWallet(wallet)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Setup Instructions */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-scale-in delay-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Setup Instructions</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h3 className="font-medium text-blue-800">Install Browser Extension</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Make sure you have the official browser extension for your hardware wallet installed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h3 className="font-medium text-green-800">Connect Your Device</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Connect your hardware wallet via USB and unlock it with your PIN.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h3 className="font-medium text-purple-800">Authorize Connection</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    Click "Connect" above and authorize the connection on your hardware wallet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
