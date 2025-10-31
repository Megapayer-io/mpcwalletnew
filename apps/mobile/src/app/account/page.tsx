'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { PinProtection } from '@/components/PinProtection';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { motion, AnimatePresence } from 'framer-motion';

// Beautiful SVG Graphics for Account Page
const AccountIcon = () => (
  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="accountGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <filter id="glowAccount">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Circle */}
    <circle cx="70" cy="70" r="65" fill="rgba(34, 225, 255, 0.08)" />
    
    {/* User Icon */}
    <motion.g
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Head */}
      <circle cx="70" cy="50" r="18" fill="none" stroke="url(#accountGradient)" strokeWidth="3" filter="url(#glowAccount)" />
      <circle cx="70" cy="50" r="14" fill="rgba(34, 225, 255, 0.1)" />
      
      {/* Body */}
      <path
        d="M45 85 Q45 70 70 70 Q95 70 95 85 Q95 100 70 115 Q45 100 45 85"
        fill="none"
        stroke="url(#accountGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#glowAccount)"
      />
    </motion.g>
    
    {/* Account Badge */}
    <motion.rect
      x="55"
      y="95"
      width="30"
      height="18"
      rx="9"
      fill="rgba(34, 225, 255, 0.25)"
      stroke="#22E1FF"
      strokeWidth="1.5"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: "spring" }}
    />
    <text x="70" y="106" textAnchor="middle" fill="#22E1FF" fontSize="9" fontWeight="bold">ACC</text>
  </svg>
);

export default function AccountPage() {
  const router = useRouter();
  const {
    address,
    isInitialized,
    isUnlocked,
    currentNetwork,
    accounts,
    currentAccount,
    switchAccount,
    createAccount,
    importAccount,
    importAccountFromMnemonic,
    getAccountSeedPhrase,
    removeAccount,
    exportPrivateKey,
    clearError,
    error
  } = useWalletStore();
  
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [revealedPrivateKey, setRevealedPrivateKey] = useState<string>('');
  const [revealedSeedPhrase, setRevealedSeedPhrase] = useState<string>('');
  const [copied, setCopied] = useState('');
  const [showPinProtection, setShowPinProtection] = useState(false);
  const [pinAction, setPinAction] = useState<'privateKey' | 'seedPhrase' | null>(null);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showImportAccount, setShowImportAccount] = useState(false);
  const [createAccountData, setCreateAccountData] = useState({ name: '' });
  const [importAccountData, setImportAccountData] = useState({
    privateKey: '',
    name: '',
    importType: 'privateKey' as 'privateKey' | 'mnemonic'
  });
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState<string | null>(null);
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    setShowSeedPhrase(false);
    setShowPrivateKey(false);
    setRevealedSeedPhrase('');
    setRevealedPrivateKey('');
  }, [currentAccount?.address]);

  useEffect(() => {
    if (isInitialized && !isUnlocked) {
      router.push('/unlock');
    }
  }, [isInitialized, isUnlocked, router]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShowPrivateKey = () => {
    setPinAction('privateKey');
    setShowPinProtection(true);
  };

  const handleShowSeedPhrase = () => {
    setPinAction('seedPhrase');
    setShowPinProtection(true);
  };

  const handlePinSuccess = () => {
    try {
      if (pinAction === 'privateKey') {
        const accountAddress = currentAccount?.address || address || '';
        if (accountAddress) {
          try {
            const privateKey = exportPrivateKey(accountAddress);
            setRevealedPrivateKey(privateKey);
            setShowPrivateKey(true);
          } catch (error) {
            console.error('Failed to export private key:', error);
            setAccountError('Failed to retrieve private key. Please try again.');
            setShowPinProtection(false);
            setPinAction(null);
            return;
          }
        }
      } else if (pinAction === 'seedPhrase') {
        const accountAddress = currentAccount?.address || address || '';
        if (accountAddress) {
          try {
            const seedPhrase = getAccountSeedPhrase(accountAddress);
            if (seedPhrase) {
              setRevealedSeedPhrase(seedPhrase);
              setShowSeedPhrase(true);
            } else {
              setAccountError('Seed phrase not available for this account.');
              setShowPinProtection(false);
              setPinAction(null);
              return;
            }
          } catch (error) {
            console.error('Failed to get seed phrase:', error);
            setAccountError('Failed to retrieve seed phrase. Please try again.');
            setShowPinProtection(false);
            setPinAction(null);
            return;
          }
        }
      }
      setShowPinProtection(false);
      setPinAction(null);
    } catch (error) {
      console.error('Error in handlePinSuccess:', error);
      setAccountError('An error occurred. Please try again.');
      setShowPinProtection(false);
      setPinAction(null);
    }
  };

  const handleCreateAccount = async () => {
    try {
      setAccountError('');
      clearError();
      const newAccount = createAccount({
        name: createAccountData.name || `Account ${accounts.length + 1}`
      });
      setCreateAccountData({ name: '' });
      setShowCreateAccount(false);
      switchAccount(newAccount.address);
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'Failed to create account');
    }
  };

  const handleImportAccount = async () => {
    try {
      setAccountError('');
      clearError();
      if (!importAccountData.privateKey.trim()) {
        setAccountError(importAccountData.importType === 'privateKey' ? 'Private key is required' : 'Seed phrase is required');
        return;
      }

      if (importAccountData.importType === 'privateKey') {
        const newAccount = await importAccount({
          privateKey: importAccountData.privateKey.trim(),
          name: importAccountData.name || 'Imported Account'
        });
        switchAccount(newAccount.address);
      } else {
        const newAccount = await importAccountFromMnemonic(
          importAccountData.privateKey.trim(),
          importAccountData.name || 'Imported Account'
        );
        switchAccount(newAccount.address);
      }
      
      setImportAccountData({ privateKey: '', name: '', importType: 'privateKey' });
      setShowImportAccount(false);
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'Failed to import account');
    }
  };

  const handleSwitchAccount = (address: string) => {
    try {
      setAccountError('');
      clearError();
      switchAccount(address);
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'Failed to switch account');
    }
  };

  const handleHidePrivateKey = () => {
    setShowPrivateKey(false);
    setRevealedPrivateKey('');
  };

  const handleHideSeedPhrase = () => {
    setShowSeedPhrase(false);
    setRevealedSeedPhrase('');
  };

  const handleRemoveAccount = async (address: string) => {
    if (accounts.length <= 1) {
      setAccountError('Cannot remove the last account');
      return;
    }

    if (confirm('Are you sure you want to remove this account? This action cannot be undone.')) {
      try {
        setAccountError('');
        clearError();
        removeAccount(address);
      } catch (error) {
        setAccountError(error instanceof Error ? error.message : 'Failed to remove account');
      }
    }
  };

  const handleExportPrivateKey = (address: string) => {
    try {
      const privateKey = exportPrivateKey(address);
      setShowPrivateKeyModal(privateKey);
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'Failed to export private key');
    }
  };

  if (!isInitialized || !isUnlocked) {
    return (
      <div className="min-h-screen megapayer-bg flex items-center justify-center px-6">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-megapayer-teal border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-megapayer-muted font-semibold font-body">
            {!isInitialized ? 'Initializing wallet...' : 'Redirecting to unlock...'}
          </p>
        </div>
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
            background: `linear-gradient(135deg, rgba(124,58,237,0.2), rgba(34,225,255,0.15))`
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
            <AccountIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-heading text-megapayer-text mb-1">
              Account Management
            </h1>
            <p className="text-sm font-body text-megapayer-muted">
              {accounts.length} account{accounts.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </motion.div>
      </div>

      {/* Current Account Info Card */}
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
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold font-heading text-megapayer-text truncate">
                {currentAccount?.name || 'Account'}
              </h2>
              <p className="text-xs font-body text-megapayer-muted truncate mt-0.5">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-megapayer-emerald flex-shrink-0"></div>
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
                Network
              </label>
              <p className="text-xs font-body megapayer-panel-soft px-3 py-2 rounded-xl text-megapayer-text">
                {currentNetwork?.name} (Chain ID: {currentNetwork?.chainId})
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Account Actions */}
      <div className="px-5 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="megapayer-panel rounded-2xl border border-megapayer-border overflow-hidden"
        >
          <div className="px-4 py-3.5 flex items-center gap-3 border-b border-megapayer-border">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#22E1FF20]">
              <CustomIcons.Plus className="w-3.5 h-3.5 text-[#22E1FF]" />
            </div>
            <h2 className="text-sm font-semibold font-heading text-megapayer-text">Account Actions</h2>
          </div>
          
          <div className="divide-y divide-megapayer-border">
            <button
              onClick={() => setShowCreateAccount(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-megapayer-panel-soft transition-colors active:bg-megapayer-panel"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#22E1FF15] flex-shrink-0">
                  <CustomIcons.Plus className="w-4 h-4 text-[#22E1FF]" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-sm font-semibold font-heading text-megapayer-text">Create New Account</h3>
                  <p className="text-xs font-body text-megapayer-muted mt-0.5">Generate a new wallet account</p>
                </div>
              </div>
              <CustomIcons.ChevronRight className="w-4 h-4 text-megapayer-muted flex-shrink-0" />
            </button>
            
            <button
              onClick={() => setShowImportAccount(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-megapayer-panel-soft transition-colors active:bg-megapayer-panel"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#7C3AED15] flex-shrink-0">
                  <CustomIcons.Download className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-sm font-semibold font-heading text-megapayer-text">Import Account</h3>
                  <p className="text-xs font-body text-megapayer-muted mt-0.5">Import using private key or seed phrase</p>
                </div>
              </div>
              <CustomIcons.ChevronRight className="w-4 h-4 text-megapayer-muted flex-shrink-0" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Accounts List - Only show if more than 1 */}
      {accounts.length > 1 && (
        <div className="px-5 pb-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="megapayer-panel rounded-2xl border border-megapayer-border overflow-hidden"
          >
            <div className="px-4 py-3.5 flex items-center gap-3 border-b border-megapayer-border">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#34D39920]">
                <CustomIcons.User className="w-3.5 h-3.5 text-[#34D399]" />
              </div>
              <h2 className="text-sm font-semibold font-heading text-megapayer-text">All Accounts</h2>
            </div>
            
            <div className="divide-y divide-megapayer-border">
              {accounts.map((account) => {
                const isActive = account.address === address;
                return (
                  <div
                    key={account.address}
                    className="flex items-center justify-between p-4 hover:bg-megapayer-panel-soft transition-colors"
                  >
                    <button
                      onClick={() => handleSwitchAccount(account.address)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-[#22E1FF]' : 'bg-megapayer-panel-soft'
                      }`}>
                        <CustomIcons.User className={`w-4 h-4 ${isActive ? 'text-white' : 'text-megapayer-muted'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-semibold font-heading truncate ${
                          isActive ? 'text-megapayer-text' : 'text-megapayer-muted'
                        }`}>
                          {account.name || 'Unnamed Account'}
                        </h3>
                        <p className="text-xs font-body text-megapayer-muted truncate mt-0.5">
                          {account.address.slice(0, 6)}...{account.address.slice(-4)}
                        </p>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-megapayer-emerald flex-shrink-0 mr-2"></div>
                      )}
                    </button>
                    {!isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAccount(account.address);
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                      >
                        <CustomIcons.X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Security Information */}
      <div className="px-5 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="megapayer-panel rounded-2xl border border-megapayer-border overflow-hidden"
        >
          <div className="px-4 py-3.5 flex items-center gap-3 border-b border-megapayer-border">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#FF7A4520]">
              <CustomIcons.Shield className="w-3.5 h-3.5 text-[#FF7A45]" />
            </div>
            <h2 className="text-sm font-semibold font-heading text-megapayer-text">Security</h2>
          </div>
          
          <div className="divide-y divide-megapayer-border">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FF7A4515] flex-shrink-0">
                  <CustomIcons.Key className="w-4 h-4 text-[#FF7A45]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold font-heading text-megapayer-text">Private Key</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {showPrivateKey && revealedPrivateKey && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(revealedPrivateKey, 'privateKey');
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-megapayer-panel-soft rounded-lg transition-colors"
                      title="Copy private key"
                    >
                      <CustomIcons.Copy className={`w-4 h-4 ${copied === 'privateKey' ? 'text-megapayer-emerald' : 'text-megapayer-muted'}`} />
                    </motion.button>
                  )}
                  <button
                    onClick={showPrivateKey ? handleHidePrivateKey : handleShowPrivateKey}
                    className="p-2 hover:bg-megapayer-panel-soft rounded-lg transition-colors"
                    title={showPrivateKey ? 'Hide private key' : 'Show private key'}
                  >
                    {showPrivateKey ? (
                      <CustomIcons.EyeOff className="w-4 h-4 text-megapayer-muted" />
                    ) : (
                      <CustomIcons.Eye className="w-4 h-4 text-megapayer-muted" />
                    )}
                  </button>
                </div>
              </div>
              {showPrivateKey ? (
                <div className="mt-2 megapayer-panel-soft p-3 rounded-xl">
                  <p className="text-xs font-mono font-body text-megapayer-text break-all">
                    {revealedPrivateKey || 'Not available'}
                  </p>
                </div>
              ) : (
                <p className="text-xs font-body text-megapayer-muted">••••••••••••••••</p>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#34D39915] flex-shrink-0">
                  <CustomIcons.Shield className="w-4 h-4 text-[#34D399]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold font-heading text-megapayer-text">Seed Phrase</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {showSeedPhrase && revealedSeedPhrase && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(revealedSeedPhrase, 'seedPhrase');
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-megapayer-panel-soft rounded-lg transition-colors"
                      title="Copy seed phrase"
                    >
                      <CustomIcons.Copy className={`w-4 h-4 ${copied === 'seedPhrase' ? 'text-megapayer-emerald' : 'text-megapayer-muted'}`} />
                    </motion.button>
                  )}
                  <button
                    onClick={showSeedPhrase ? handleHideSeedPhrase : handleShowSeedPhrase}
                    className="p-2 hover:bg-megapayer-panel-soft rounded-lg transition-colors"
                    title={showSeedPhrase ? 'Hide seed phrase' : 'Show seed phrase'}
                  >
                    {showSeedPhrase ? (
                      <CustomIcons.EyeOff className="w-4 h-4 text-megapayer-muted" />
                    ) : (
                      <CustomIcons.Eye className="w-4 h-4 text-megapayer-muted" />
                    )}
                  </button>
                </div>
              </div>
              {showSeedPhrase ? (
                <div className="mt-2 megapayer-panel-soft p-3 rounded-xl">
                  <p className="text-xs font-mono font-body text-megapayer-text break-all">
                    {revealedSeedPhrase || 'Not available'}
                  </p>
                </div>
              ) : (
                <p className="text-xs font-body text-megapayer-muted">••••••••••••••••</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Error Message */}
      {accountError && (
        <div className="px-5 pb-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 megapayer-panel-soft border border-red-500/50 rounded-xl"
          >
            <p className="text-sm font-body text-red-400 text-center">{accountError}</p>
          </motion.div>
        </div>
      )}

      {/* Create Account Modal */}
      <AnimatePresence>
        {showCreateAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
            onClick={() => setShowCreateAccount(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="megapayer-panel rounded-2xl border border-megapayer-border p-6 w-full max-w-sm shadow-xl"
            >
              <h3 className="text-xl font-bold font-heading text-megapayer-text mb-1">Create New Account</h3>
              <p className="text-xs font-body text-megapayer-muted mb-5">Generate a new wallet account</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold font-heading text-megapayer-text mb-2">
                    Account Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={createAccountData.name}
                    onChange={(e) => setCreateAccountData({ name: e.target.value })}
                    placeholder={`Account ${accounts.length + 1}`}
                    className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text font-body placeholder-megapayer-muted focus:ring-2 focus:ring-megapayer-teal focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={() => setShowCreateAccount(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl font-semibold font-heading text-megapayer-text"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleCreateAccount}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 megapayer-btn-primary rounded-xl font-bold font-heading"
                  >
                    Create
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Account Modal */}
      <AnimatePresence>
        {showImportAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
            onClick={() => setShowImportAccount(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="megapayer-panel rounded-2xl border border-megapayer-border p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-xl"
            >
              <h3 className="text-xl font-bold font-heading text-megapayer-text mb-1">Import Account</h3>
              <p className="text-xs font-body text-megapayer-muted mb-5">Import using private key or seed phrase</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold font-heading text-megapayer-text mb-2">
                    Import Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setImportAccountData({ ...importAccountData, importType: 'privateKey' })}
                      className={`flex-1 py-2.5 rounded-xl font-semibold font-heading text-sm transition-all ${
                        importAccountData.importType === 'privateKey'
                          ? 'megapayer-btn-primary'
                          : 'megapayer-panel-soft border border-megapayer-border text-megapayer-muted'
                      }`}
                    >
                      Private Key
                    </button>
                    <button
                      onClick={() => setImportAccountData({ ...importAccountData, importType: 'mnemonic' })}
                      className={`flex-1 py-2.5 rounded-xl font-semibold font-heading text-sm transition-all ${
                        importAccountData.importType === 'mnemonic'
                          ? 'megapayer-btn-primary'
                          : 'megapayer-panel-soft border border-megapayer-border text-megapayer-muted'
                      }`}
                    >
                      Seed Phrase
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold font-heading text-megapayer-text mb-2">
                    {importAccountData.importType === 'privateKey' ? 'Private Key' : 'Seed Phrase'}
                  </label>
                  <textarea
                    value={importAccountData.privateKey}
                    onChange={(e) => setImportAccountData({ ...importAccountData, privateKey: e.target.value })}
                    placeholder={importAccountData.importType === 'privateKey' ? 'Enter private key (0x...)' : 'Enter seed phrase (12 or 24 words)'}
                    rows={4}
                    className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text font-body placeholder-megapayer-muted resize-none focus:ring-2 focus:ring-megapayer-teal focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold font-heading text-megapayer-text mb-2">
                    Account Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={importAccountData.name}
                    onChange={(e) => setImportAccountData({ ...importAccountData, name: e.target.value })}
                    placeholder="Imported Account"
                    className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text font-body placeholder-megapayer-muted focus:ring-2 focus:ring-megapayer-teal focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={() => setShowImportAccount(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl font-semibold font-heading text-megapayer-text"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleImportAccount}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 megapayer-btn-primary rounded-xl font-bold font-heading"
                  >
                    Import
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Private Key Modal */}
      <AnimatePresence>
        {showPrivateKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
            onClick={() => setShowPrivateKeyModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="megapayer-panel rounded-2xl border border-megapayer-border p-6 w-full max-w-sm shadow-xl"
            >
              <h3 className="text-xl font-bold font-heading text-megapayer-text mb-4">Private Key</h3>
              <div className="megapayer-panel-soft p-4 rounded-xl mb-4">
                <p className="text-xs font-mono font-body text-megapayer-text break-all">{showPrivateKeyModal}</p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => handleCopy(showPrivateKeyModal, 'privateKey')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl font-semibold font-heading text-megapayer-text flex items-center justify-center gap-2"
                >
                  <CustomIcons.Copy className="w-4 h-4" />
                  Copy
                </motion.button>
                <motion.button
                  onClick={() => setShowPrivateKeyModal(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 megapayer-btn-primary rounded-xl font-bold font-heading"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pin Protection Modal */}
      <PinProtection
        isOpen={showPinProtection}
        onClose={() => {
          setShowPinProtection(false);
          setPinAction(null);
        }}
        onSuccess={handlePinSuccess}
        title={pinAction === 'privateKey' ? 'Reveal Private Key' : 'Reveal Seed Phrase'}
        description={pinAction === 'privateKey' 
          ? 'Enter your wallet password to reveal your private key'
          : 'Enter your wallet password to reveal your seed phrase'}
      />
    </div>
  );
}
