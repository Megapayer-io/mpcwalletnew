'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { isBiometricAvailable, isBiometricEnabled, enableBiometric, disableBiometric, getBiometricType } from '@/lib/biometric';
import { Capacitor } from '@capacitor/core';

// Beautiful SVG Graphics for Settings Page
const SettingsIcon = () => (
  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="settingsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <filter id="glowSettings">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Circle */}
    <circle cx="70" cy="70" r="65" fill="rgba(34, 225, 255, 0.08)" />
    
    {/* Gear/Cog */}
    <motion.g
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <path
        d="M70 25 L78 28 L82 25 L82 32 L90 36 L94 44 L90 52 L82 56 L82 63 L78 60 L70 63 L62 60 L58 63 L58 56 L50 52 L46 44 L50 36 L58 32 L58 25 L62 28 Z"
        fill="none"
        stroke="url(#settingsGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glowSettings)"
      />
      <circle cx="70" cy="44" r="6" fill="none" stroke="url(#settingsGradient)" strokeWidth="2.5" />
      <circle cx="70" cy="44" r="3" fill="url(#settingsGradient)" opacity="0.8" />
    </motion.g>
    
    {/* Inner Gear */}
    <motion.g
      initial={{ rotate: 360 }}
      animate={{ rotate: 0 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="70" cy="70" r="20" fill="none" stroke="url(#settingsGradient)" strokeWidth="2.5" filter="url(#glowSettings)" />
      <circle cx="70" cy="70" r="12" fill="rgba(34, 225, 255, 0.1)" />
    </motion.g>
    
    {/* Floating Particles */}
    {[...Array(6)].map((_, i) => {
      const angle = (i * 60) * Math.PI / 180;
      const radius = 50;
      const x = 70 + Math.cos(angle) * radius;
      const y = 70 + Math.sin(angle) * radius;
      return (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="2.5"
          fill="#22E1FF"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0]
          }}
          transition={{
            delay: i * 0.3,
            duration: 2,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

export default function SettingsPage() {
  const router = useRouter();
  const {
    address,
    isUnlocked,
    currentNetwork,
    lock,
    unlock,
    wallet,
    changePassword
  } = useWalletStore();
  
  const [copied, setCopied] = useState('');
  const [customTokens, setCustomTokens] = useState<any[]>([]);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [isTogglingBiometric, setIsTogglingBiometric] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    loadCustomTokens();
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    if (Capacitor.isNativePlatform()) {
      const available = await isBiometricAvailable();
      const enabled = await isBiometricEnabled();
      const type = await getBiometricType();
      setBiometricAvailable(available);
      setBiometricEnabled(enabled);
      setBiometricType(type);
    }
  };

  const handleToggleBiometric = async () => {
    if (!biometricAvailable) return;
    
    setIsTogglingBiometric(true);
    try {
      if (biometricEnabled) {
        // Disable biometric
        const result = await disableBiometric();
        if (result.success) {
          setBiometricEnabled(false);
        } else {
          alert(`Failed to disable ${biometricType}. Please try again.`);
        }
      } else {
        // Enable biometric - need to unlock first to get the password token
        // Prompt user to unlock with password, then enable biometric
        const currentPassword = prompt(`To enable ${biometricType}, please enter your current password:`);
        if (currentPassword) {
          try {
            // Try to unlock with the password to verify it
            await unlock(currentPassword);
            // If successful, enable biometric with the password
            const result = await enableBiometric(currentPassword);
            if (result.success) {
              setBiometricEnabled(true);
              alert(`${biometricType} has been enabled successfully!`);
            } else {
              alert(result.error || `Failed to enable ${biometricType}. Please try again.`);
              // Lock again if biometric enable failed
              lock();
            }
          } catch (error) {
            alert('Incorrect password. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle biometric:', error);
      alert(`Failed to toggle ${biometricType}. Please try again.`);
    } finally {
      setIsTogglingBiometric(false);
    }
  };

  const handleChangePassword = async () => {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;

    const newPassword = prompt('Enter your new password (min 8 characters):');
    if (!newPassword || newPassword.length < 8) {
      alert('New password must be at least 8 characters long.');
      return;
    }

    const confirmPassword = prompt('Confirm your new password:');
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      // Verify current password by unlocking (if not already unlocked)
      if (!isUnlocked) {
        await unlock(currentPassword);
      }
      
      // Change password
      await changePassword(currentPassword, newPassword);
      alert('Password changed successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to change password. Please try again.');
    }
  };

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

  const handleLock = () => {
    lock();
    router.push('/unlock');
  };

  const settingsSections = [
    {
      title: 'Account',
      icon: CustomIcons.User,
      color: '#22E1FF',
      items: [
        {
          name: 'Account Management',
          description: 'Manage your wallet accounts',
          href: '/account',
          icon: CustomIcons.User
        },
        {
          name: 'Import Tokens',
          description: 'Add custom tokens to your wallet',
          href: '/tokens',
          icon: CustomIcons.Zap
        },
        {
          name: 'Wallet Connect',
          description: 'Connect to dApps and wallets',
          href: '#',
          icon: CustomIcons.Globe,
          onClick: () => console.log('Wallet Connect clicked - Coming soon')
        }
      ]
    },
    {
      title: 'Network',
      icon: CustomIcons.Globe,
      color: '#7C3AED',
      items: [
        {
          name: 'Networks',
          description: 'Manage blockchain networks',
          href: '/networks',
          icon: CustomIcons.Globe
        }
      ]
    },
    {
      title: 'Security',
      icon: CustomIcons.Shield,
      color: '#34D399',
      items: [
        ...(biometricAvailable ? [{
          name: `${biometricType} Unlock`,
          description: biometricEnabled ? `Enabled - Use ${biometricType} to unlock` : `Disabled - Enable ${biometricType} unlock`,
          href: '#',
          icon: CustomIcons.Shield,
          onClick: handleToggleBiometric,
          isToggle: true,
          toggleValue: biometricEnabled,
          toggleLoading: isTogglingBiometric
        }] : []),
        {
          name: 'Change Password',
          description: 'Update your wallet password',
          href: '#',
          icon: CustomIcons.Lock,
          onClick: handleChangePassword
        },
        {
          name: 'Notifications',
          description: 'Manage notification preferences',
          href: '#',
          icon: CustomIcons.Bell,
          onClick: () => console.log('Notifications clicked')
        },
        {
          name: 'Help & Support',
          description: 'Get help and support',
          href: '/help',
          icon: CustomIcons.HelpCircle
        },
        {
          name: 'Lock Wallet',
          description: 'Lock your wallet for security',
          href: '#',
          icon: CustomIcons.Lock,
          onClick: handleLock,
          isDestructive: true
        }
      ]
    }
  ];

  if (!isUnlocked) {
    return (
      <div className="min-h-screen megapayer-bg flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <CustomIcons.AlertTriangle className="w-16 h-16 text-megapayer-muted mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-heading text-megapayer-text mb-2">Wallet Locked</h1>
          <p className="text-megapayer-muted font-body">
            Please unlock your wallet to access settings.
          </p>
        </motion.div>
        </div>
    );
  }

  return (
    <div className="min-h-screen megapayer-bg flex flex-col relative overflow-hidden pb-24">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-8"
          style={{
            background: `linear-gradient(135deg, rgba(34,225,255,0.2), rgba(124,58,237,0.15))`
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header Section */}
      <div className="px-5 pt-6 pb-3 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4"
        >
          <div className="flex-shrink-0 mt-1">
            <SettingsIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-heading text-megapayer-text mb-1">
              Settings
            </h1>
            <p className="text-sm font-body text-megapayer-muted">
              Manage your wallet preferences
            </p>
          </div>
        </motion.div>
      </div>

      {/* Wallet Info Card */}
      <div className="px-5 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="megapayer-panel p-4 rounded-2xl border border-megapayer-border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-megapayer-teal to-megapayer-violet rounded-xl flex items-center justify-center flex-shrink-0">
              <CustomIcons.Wallet className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-semibold font-heading text-megapayer-text">Wallet Info</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold font-heading text-megapayer-muted mb-1.5">
                Wallet Address
              </label>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono font-body megapayer-panel-soft px-3 py-2 rounded-xl flex-1 break-all text-megapayer-text">
                  {address}
                </p>
                <motion.button
                  onClick={() => handleCopy(address || '', 'address')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 megapayer-panel-soft rounded-lg hover:bg-megapayer-panel transition-colors flex-shrink-0"
                >
                  {copied === 'address' ? (
                    <CustomIcons.CheckCircle className="w-4 h-4 text-megapayer-emerald" />
                  ) : (
                    <CustomIcons.Copy className="w-4 h-4 text-megapayer-muted" />
                  )}
                </motion.button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold font-heading text-megapayer-muted mb-1.5">
                Current Network
              </label>
              <p className="text-xs font-body megapayer-panel-soft px-3 py-2 rounded-xl text-megapayer-text">
                  {currentNetwork?.name} (Chain ID: {currentNetwork?.chainId})
                </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom Tokens Preview */}
      {customTokens.length > 0 && (
        <div className="px-5 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="megapayer-panel p-4 rounded-2xl border border-megapayer-border"
        >
            <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-megapayer-accent to-megapayer-violet rounded-xl flex items-center justify-center flex-shrink-0">
                  <CustomIcons.Zap className="w-5 h-5 text-white" />
              </div>
                <h2 className="text-base font-semibold font-heading text-megapayer-text">Custom Tokens</h2>
            </div>
              <Link href="/tokens">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 megapayer-btn-primary rounded-xl font-semibold font-heading text-xs flex items-center gap-1.5"
            >
                  <CustomIcons.Plus className="w-3.5 h-3.5" />
                  <span>Manage</span>
                </motion.button>
            </Link>
          </div>
          
            <div className="flex items-center gap-2 text-xs font-body text-megapayer-muted">
              <span>{customTokens.length} token{customTokens.length !== 1 ? 's' : ''} added</span>
                  </div>
                </motion.div>
            </div>
          )}

        {/* Settings Sections */}
      <div className="px-5 space-y-4 relative z-10 flex-1">
        {settingsSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + sectionIndex * 0.1 }}
              className="megapayer-panel rounded-2xl border border-megapayer-border overflow-hidden"
            >
              <div className="px-4 py-3.5 flex items-center gap-3 border-b border-megapayer-border">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${section.color}20` }}>
                  <div style={{ color: section.color }}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h2 className="text-sm font-semibold font-heading text-megapayer-text">{section.title}</h2>
              </div>
              
              <div className="divide-y divide-megapayer-border">
                {section.items.map((item, index) => {
                  const ItemIcon = item.icon;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + sectionIndex * 0.1 + index * 0.05 }}
                    >
                      {item.href && item.href !== '#' ? (
                        <Link
                          href={item.href}
                          className="flex items-center justify-between p-4 hover:bg-megapayer-panel-soft transition-colors active:bg-megapayer-panel"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${section.color}15` }}>
                              <div style={{ color: section.color }}>
                                <ItemIcon className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-sm font-semibold font-heading truncate ${
                                item.isDestructive ? 'text-red-400' : 'text-megapayer-text'
                              }`}>
                                {item.name}
                              </h3>
                              <p className="text-xs font-body text-megapayer-muted truncate mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <CustomIcons.ChevronRight className="w-4 h-4 text-megapayer-muted flex-shrink-0" />
                        </Link>
                      ) : (
                        <button
                          onClick={item.onClick}
                          disabled={(item as any).toggleLoading}
                          className="w-full flex items-center justify-between p-4 hover:bg-megapayer-panel-soft transition-colors active:bg-megapayer-panel disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${section.color}15` }}>
                              <div style={{ color: section.color }}>
                                <ItemIcon className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <h3 className={`text-sm font-semibold font-heading truncate ${
                                item.isDestructive ? 'text-red-400' : 'text-megapayer-text'
                              }`}>
                                {item.name}
                              </h3>
                              <p className="text-xs font-body text-megapayer-muted truncate mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          {(item as any).isToggle ? (
                            <div className="flex-shrink-0">
                              {(item as any).toggleLoading ? (
                                <div className="w-5 h-5 border-2 border-megapayer-teal border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  (item as any).toggleValue ? 'bg-megapayer-teal' : 'bg-megapayer-muted/40'
                                }`}>
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      (item as any).toggleValue ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <CustomIcons.ChevronRight className="w-4 h-4 text-megapayer-muted flex-shrink-0" />
                          )}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* Coming in 2.0.0 Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="megapayer-panel rounded-2xl border border-megapayer-border overflow-hidden"
        >
          <div className="px-4 py-3.5 flex items-center gap-3 border-b border-megapayer-border">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#FF7A4520]">
              <CustomIcons.Zap className="w-3.5 h-3.5 text-[#FF7A45]" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold font-heading text-megapayer-text">Coming in 2.0.0</h2>
              <p className="text-xs font-body text-megapayer-muted mt-0.5">Exciting features on the way</p>
            </div>
          </div>
          
          <div className="divide-y divide-megapayer-border">
            {/* Swap */}
            <div className="flex items-center justify-between p-4 opacity-60">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#22E1FF15]">
                  <CustomIcons.Swap className="w-4 h-4 text-[#22E1FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold font-heading text-megapayer-text truncate">
                    Swap
                  </h3>
                  <p className="text-xs font-body text-megapayer-muted truncate mt-0.5">
                    Exchange tokens instantly
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#FF7A4520] text-[#FF7A45] rounded-full text-xs font-bold font-heading flex-shrink-0">
                SOON
              </span>
            </div>

            {/* P2P */}
            <div className="flex items-center justify-between p-4 opacity-60">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#7C3AED15]">
                  <CustomIcons.User className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold font-heading text-megapayer-text truncate">
                    P2P
                  </h3>
                  <p className="text-xs font-body text-megapayer-muted truncate mt-0.5">
                    Peer-to-peer transactions
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#FF7A4520] text-[#FF7A45] rounded-full text-xs font-bold font-heading flex-shrink-0">
                SOON
              </span>
            </div>

            {/* Buy with Card */}
            <div className="flex items-center justify-between p-4 opacity-60">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#34D39915]">
                  <CustomIcons.Wallet className="w-4 h-4 text-[#34D399]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold font-heading text-megapayer-text truncate">
                    Buy with Card
                  </h3>
                  <p className="text-xs font-body text-megapayer-muted truncate mt-0.5">
                    Purchase crypto with debit/credit card
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#FF7A4520] text-[#FF7A45] rounded-full text-xs font-bold font-heading flex-shrink-0">
                SOON
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Version Info */}
      <div className="px-5 py-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <p className="text-xs font-body text-megapayer-muted">
            Version <span className="font-semibold font-heading text-megapayer-text">1.0.0</span>
          </p>
        </motion.div>
      </div>
      </div>
  );
}
