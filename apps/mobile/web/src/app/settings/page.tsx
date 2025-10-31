'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Layout } from '@/components/layout/Layout';
import { 
  Settings, 
  User, 
  Zap, 
  Shield, 
  Bell, 
  HelpCircle, 
  Lock,
  Globe,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SettingsPage() {
  const {
    address,
    isUnlocked,
    currentNetwork,
    networks,
    selectNetwork,
    lock,
    logout
  } = useWalletStore();
  
  const [copied, setCopied] = useState('');
  const [customTokens, setCustomTokens] = useState<any[]>([]);

  useEffect(() => {
    loadCustomTokens();
  }, []);

  const loadCustomTokens = () => {
    const storedTokens = localStorage.getItem('mpc-wallet-tokens');
    if (storedTokens) {
      setCustomTokens(JSON.parse(storedTokens));
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleRemoveToken = (tokenAddress: string) => {
    const updatedTokens = customTokens.filter(token => token.address !== tokenAddress);
    setCustomTokens(updatedTokens);
    localStorage.setItem('mpc-wallet-tokens', JSON.stringify(updatedTokens));
  };

  const settingsSections = [
    {
      title: 'Account Management',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      items: [
        {
          name: 'Account Management',
          description: 'Manage your wallet account and settings',
          href: '/account',
          icon: User
        },
        {
          name: 'Import Tokens',
          description: 'Add custom ERC-20 tokens to your wallet',
          href: '/tokens',
          icon: Zap
        },
        {
          name: 'Hardware Wallet',
          description: 'Connect and manage hardware wallets',
          href: '/hardware',
          icon: Shield
        }
      ]
    },
    {
      title: 'Network Settings',
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      items: [
        {
          name: 'Networks',
          description: 'Manage blockchain networks',
          href: '/networks',
          icon: Globe
        }
      ]
    },
    {
      title: 'Support & Security',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      items: [
        {
          name: 'Notifications',
          description: 'Manage notification preferences',
          href: '#',
          icon: Bell,
          onClick: () => console.log('Notifications clicked')
        },
        {
          name: 'Help & Support',
          description: 'Get help and support',
          href: '#',
          icon: HelpCircle,
          onClick: () => console.log('Help clicked')
        },
        {
          name: 'Lock Wallet',
          description: 'Lock your wallet for security',
          href: '#',
          icon: Lock,
          onClick: () => {
            lock();
            window.location.href = '/unlock';
          },
          isDestructive: true
        } as any
      ]
    }
  ];

  if (!isUnlocked) {
    return (
      <Layout title="Settings" subtitle="Manage your wallet settings and preferences">
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-fade-in" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in-up">Wallet Locked</h1>
          <p className="text-gray-600 animate-fade-in-up delay-100">
            Please unlock your wallet to access settings.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Settings" subtitle="Manage your wallet settings and preferences">
      <div className="space-y-8 animate-fade-in-up">
        {/* Wallet Overview */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-scale-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Wallet Overview</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-gray-100 p-3 rounded-lg break-all flex-1">
                  {address}
                </p>
                <button
                  onClick={() => handleCopy(address || '', 'address')}
                  className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Copy address"
                >
                  {copied === 'address' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Network</label>
              <div className="flex items-center gap-2">
                <p className="text-sm bg-gray-100 p-3 rounded-lg flex-1">
                  {currentNetwork?.name} (Chain ID: {currentNetwork?.chainId})
                </p>
                <button
                  onClick={loadCustomTokens}
                  className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Custom Tokens */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-scale-in delay-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Custom Tokens</h2>
            </div>
            <Link
              href="/tokens"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Token
            </Link>
          </div>
          
          {customTokens.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Custom Tokens</h3>
              <p className="text-gray-600 mb-4">You haven't added any custom tokens yet.</p>
              <Link
                href="/tokens"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Token
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {customTokens.map((token, index) => (
                <motion.div
                  key={token.address}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {token.symbol.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{token.symbol}</h3>
                      <p className="text-sm text-gray-600">{token.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(token.address, token.address)}
                      className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                      title="Copy contract address"
                    >
                      {copied === token.address ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleRemoveToken(token.address)}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                      title="Remove token"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-scale-in"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + sectionIndex * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 ${section.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${section.color}`} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
              </div>
              
              <div className="space-y-3">
                {section.items.map((item, index) => {
                  const ItemIcon = item.icon;
                  return (
                    <motion.div
                      key={item.name}
                      className="group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + sectionIndex * 0.1 + index * 0.05 }}
                    >
                      {item.href && item.href !== '#' ? (
                        <Link
                          href={item.href}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${section.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <ItemIcon className={`w-4 h-4 ${section.color}`} />
                            </div>
                            <div>
                              <h3 className={`font-semibold ${item.isDestructive ? 'text-red-600' : 'text-gray-900'}`}>
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${item.isDestructive ? 'bg-red-500' : 'bg-gray-300 group-hover:bg-blue-500'} transition-colors`}></div>
                        </Link>
                      ) : (
                        <button
                          onClick={item.onClick}
                          className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${section.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <ItemIcon className={`w-4 h-4 ${section.color}`} />
                            </div>
                            <div>
                              <h3 className={`font-semibold ${item.isDestructive ? 'text-red-600' : 'text-gray-900'}`}>
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${item.isDestructive ? 'bg-red-500' : 'bg-gray-300 group-hover:bg-blue-500'} transition-colors`}></div>
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Layout>
  );
}
