'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { Layout } from '@/components/layout/Layout';
import { PinProtection } from '@/components/PinProtection';
import { CustomIcons } from '@/components/icons/CustomIcons';

export default function AccountPage() {
  const router = useRouter();
  const {
    address,
    isInitialized,
    isUnlocked,
    currentNetwork,
    balance,
    getBalance,
    logout,
    lock,
    wallet,
    accounts,
    currentAccount,
    switchAccount,
    createAccount,
    importAccount,
    importWallet,
    importAccountFromMnemonic,
    getAccountSeedPhrase,
    removeAccount,
    exportPrivateKey,
    clearError,
    error
  } = useWalletStore();
  
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [copied, setCopied] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPinProtection, setShowPinProtection] = useState(false);
  const [pinAction, setPinAction] = useState<'privateKey' | 'seedPhrase' | null>(null);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showImportAccount, setShowImportAccount] = useState(false);
  const [createAccountData, setCreateAccountData] = useState({ name: '' });
  const [importAccountData, setImportAccountData] = useState({
    privateKey: '',
    name: '',
    importType: 'privateKey' as 'privateKey' | 'mnemonic' | 'backup'
  });
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState<string | null>(null);
  const [accountError, setAccountError] = useState('');

  // Reset seed phrase visibility when account changes
  useEffect(() => {
    console.log('Account changed, resetting seed phrase visibility. Current account:', currentAccount?.address);
    setShowSeedPhrase(false);
  }, [currentAccount?.address]);

  // Redirect to unlock page if wallet is locked
  useEffect(() => {
    // Only redirect if wallet is initialized and locked
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

  const handleExportWallet = () => {
    if (wallet && isUnlocked) {
      try {
        // Check if methods exist before calling them
        if (typeof wallet.getPrivateKey !== 'function') {
          alert('Wallet export methods not available. Please try refreshing the page.');
          return;
        }

        const privateKey = wallet.getPrivateKey();
        const mnemonic = getAccountSeedPhrase(currentAccount?.address || '') || 'Not available';
        
        const exportData = {
          address: currentAccount?.address || address,
          privateKey: privateKey,
          mnemonic: mnemonic,
          network: currentNetwork?.name,
          exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mpc-wallet-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to export wallet:', error);
        alert('Failed to export wallet data: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const handleDeleteWallet = () => {
    if (window.confirm('Are you sure you want to delete this wallet? This action cannot be undone.')) {
      logout();
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
    if (pinAction === 'privateKey') {
      setShowPrivateKey(true);
    } else if (pinAction === 'seedPhrase') {
      setShowSeedPhrase(true);
    }
    setPinAction(null);
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
      
      // Switch to the new account
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

      console.log('Starting import process:', importAccountData.importType);

      if (importAccountData.importType === 'privateKey') {
        // Import individual account with private key
        console.log('Importing private key account...');
        const newAccount = await importAccount({
          privateKey: importAccountData.privateKey.trim(),
          name: importAccountData.name || 'Imported Account'
        });
        
        console.log('Private key account imported successfully:', newAccount);
        
        // Switch to the new account
        switchAccount(newAccount.address);
      } else if (importAccountData.importType === 'mnemonic') {
        // Import account from mnemonic (adds as new account, preserves existing accounts)
        console.log('Importing account from mnemonic...');
        const newAccount = await importAccountFromMnemonic(
          importAccountData.privateKey.trim(),
          importAccountData.name || 'Imported Account'
        );
        console.log('Account imported successfully from mnemonic:', newAccount);
        
        // Switch to the new account
        switchAccount(newAccount.address);
      } else if (importAccountData.importType === 'backup') {
        // Handle backup file import - treat as mnemonic import
        console.log('Importing account from backup...');
        const newAccount = await importAccountFromMnemonic(
          importAccountData.privateKey.trim(),
          importAccountData.name || 'Imported Account'
        );
        console.log('Account imported successfully from backup:', newAccount);
        
        // Switch to the new account
        switchAccount(newAccount.address);
      }
      
      // Only close modal and reset data if import was successful
      setImportAccountData({ privateKey: '', name: '', importType: 'privateKey' });
      setShowImportAccount(false);
      
    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import account';
      setAccountError(errorMessage);
      // Don't close the modal on error so user can see the error message
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

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.mnemonic) {
          setImportAccountData(prev => ({
            ...prev,
            privateKey: data.mnemonic,
            importType: 'backup'
          }));
        } else {
          setAccountError('Invalid backup file format');
        }
      } catch (error) {
        setAccountError('Failed to read backup file');
      }
    };
    reader.readAsText(file);
  };

  // Show loading while redirecting
  if (!isInitialized || !isUnlocked) {
    return (
      <Layout title="Account Management">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-megapayer-teal via-megapayer-violet to-megapayer-accent rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CustomIcons.User className="w-10 h-10 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-megapayer-text mb-2">
            {!isInitialized ? 'Initializing wallet...' : 'Redirecting to unlock page...'}
          </h1>
          <p className="text-megapayer-muted">
            {!isInitialized 
              ? 'Please wait while we initialize your wallet.' 
              : 'Please wait while we redirect you to unlock your wallet.'
            }
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Account Management">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="megapayer-panel p-8 text-megapayer-text relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-megapayer-violet/10 via-megapayer-teal/10 to-megapayer-emerald/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-megapayer-violet to-megapayer-teal rounded-2xl flex items-center justify-center shadow-lg">
                  <CustomIcons.User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2 font-heading text-megapayer-text">Account Management</h1>
                  <p className="text-megapayer-muted text-lg">Manage your wallet account and security settings</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-megapayer-muted text-sm mb-1">Total Accounts</p>
                <p className="text-4xl font-bold text-megapayer-text">{accounts.length}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <div className="w-3 h-3 bg-megapayer-emerald rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-megapayer-emerald">Active</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-megapayer-violet/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-megapayer-teal/5 rounded-full"></div>
        </div>

        {/* Account Overview */}
        <div className="megapayer-panel p-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald rounded-xl flex items-center justify-center shadow-lg">
                <CustomIcons.Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-megapayer-text font-heading">Account Overview</h2>
                <p className="text-megapayer-muted">Current wallet information and status</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-megapayer-emerald rounded-full animate-pulse"></div>
              <span className="text-sm text-megapayer-emerald font-medium">Active</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
              <label className="block text-sm font-semibold text-megapayer-text mb-3">Wallet Address</label>
              <div className="flex items-center gap-3">
                <p className="text-sm font-mono bg-megapayer-panel p-3 rounded-xl break-all flex-1 text-megapayer-text">
                  {address}
                </p>
                <button
                  onClick={() => handleCopy(address || '', 'address')}
                  className="p-3 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
                  title="Copy address"
                >
                  {copied === 'address' ? <CustomIcons.CheckCircle className="h-4 w-4 text-megapayer-emerald" /> : <CustomIcons.Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
              <label className="block text-sm font-semibold text-megapayer-text mb-3">Current Network</label>
              <div className="flex items-center gap-3">
                <p className="text-sm bg-megapayer-panel p-3 rounded-xl flex-1 text-megapayer-text">
                  {currentNetwork?.name} (Chain ID: {currentNetwork?.chainId})
                </p>
                <button
                  onClick={() => getBalance()}
                  disabled={isLoading}
                  className="p-3 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50"
                  title="Refresh balance"
                >
                  <CustomIcons.Refresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Information */}
        <div className="megapayer-panel p-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-megapayer-emerald to-megapayer-teal rounded-xl flex items-center justify-center shadow-lg">
              <CustomIcons.Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-megapayer-text font-heading">Security Information</h2>
              <p className="text-megapayer-muted">Wallet security details and sensitive data</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
              <div className="flex items-start gap-4">
                <CustomIcons.AlertTriangle className="w-5 h-5 text-megapayer-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-megapayer-text mb-2">Important Security Notice</h3>
                  <p className="text-sm text-megapayer-muted">
                    Never share your private key or seed phrase with anyone. These provide full access to your wallet.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
                <label className="block text-sm font-semibold text-megapayer-text mb-3">Private Key</label>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-mono bg-megapayer-panel p-3 rounded-xl break-all flex-1 text-megapayer-text">
                    {showPrivateKey ? (wallet && typeof wallet.getPrivateKey === 'function' ? wallet.getPrivateKey() : 'Not available') : '••••••••••••••••'}
                  </p>
                  <button
                    onClick={showPrivateKey ? () => setShowPrivateKey(false) : handleShowPrivateKey}
                    className="p-3 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
                    title={showPrivateKey ? 'Hide private key' : 'Show private key'}
                  >
                    {showPrivateKey ? <CustomIcons.EyeOff className="h-4 w-4" /> : <CustomIcons.Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleCopy('0x1234...5678', 'privateKey')}
                    className="p-3 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
                    title="Copy private key"
                  >
                    {copied === 'privateKey' ? <CustomIcons.CheckCircle className="h-4 w-4 text-megapayer-emerald" /> : <CustomIcons.Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
                <label className="block text-sm font-semibold text-megapayer-text mb-3">Seed Phrase</label>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-mono bg-megapayer-panel p-3 rounded-xl break-all flex-1 text-megapayer-text">
                    {showSeedPhrase ? (() => {
                      const addressToUse = currentAccount?.address || '';
                      console.log('Account page: Getting seed phrase for address:', addressToUse);
                      return getAccountSeedPhrase(addressToUse) || 'Not available';
                    })() : '••••••••••••••••'}
                  </p>
                  <button
                    onClick={showSeedPhrase ? () => setShowSeedPhrase(false) : handleShowSeedPhrase}
                    className="p-3 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
                    title={showSeedPhrase ? 'Hide seed phrase' : 'Show seed phrase'}
                  >
                    {showSeedPhrase ? <CustomIcons.EyeOff className="h-4 w-4" /> : <CustomIcons.Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleCopy('word1 word2 word3...', 'seedPhrase')}
                    className="p-3 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
                    title="Copy seed phrase"
                  >
                    {copied === 'seedPhrase' ? <CustomIcons.CheckCircle className="h-4 w-4 text-megapayer-emerald" /> : <CustomIcons.Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Management */}
        <div className="megapayer-panel p-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-accent to-megapayer-violet rounded-xl flex items-center justify-center shadow-lg">
                <CustomIcons.User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-megapayer-text font-heading">Account Management</h2>
                <p className="text-megapayer-muted">Manage multiple wallet accounts</p>
              </div>
            </div>
            <div className="text-sm text-megapayer-muted">
              {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Error Display */}
          {(error || accountError) && (
            <div className="mb-8 p-6 megapayer-panel-soft rounded-xl border border-megapayer-accent/20 bg-megapayer-accent/5">
              <div className="flex items-center gap-3">
                <CustomIcons.AlertTriangle className="h-5 w-5 text-megapayer-accent" />
                <p className="text-sm text-megapayer-accent font-medium">{error || accountError}</p>
              </div>
            </div>
          )}

          {/* Accounts List */}
          <div className="space-y-4 mb-8">
            {accounts.map((account, index) => (
              <div
                key={account.address}
                className={`megapayer-panel-soft p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up ${
                  currentAccount?.address === account.address
                    ? 'border-2 border-megapayer-teal/50 bg-gradient-to-r from-megapayer-teal/5 to-megapayer-emerald/5'
                    : 'border border-megapayer-border-soft hover:border-megapayer-border'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                      currentAccount?.address === account.address
                        ? 'bg-gradient-to-br from-megapayer-teal to-megapayer-emerald'
                        : 'bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel'
                    }`}>
                      {account.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-megapayer-text text-lg">{account.name}</p>
                      <p className="text-sm text-megapayer-muted font-mono">
                        {account.address.slice(0, 6)}...{account.address.slice(-4)}
                      </p>
                      {account.isImported && (
                        <span className="inline-block px-2 py-1 text-xs bg-megapayer-accent/20 text-megapayer-accent rounded-full mt-1 font-medium">
                          Imported
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {currentAccount?.address !== account.address && (
                      <button
                        onClick={() => handleSwitchAccount(account.address)}
                        className="px-4 py-2 megapayer-btn-primary rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
                      >
                        Switch
                      </button>
                    )}
                    {currentAccount?.address === account.address && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-megapayer-emerald/20 text-megapayer-emerald rounded-full">
                        <CustomIcons.CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Active</span>
                      </div>
                    )}
                    {accounts.length > 1 && (
                      <button
                        onClick={() => handleRemoveAccount(account.address)}
                        className="p-3 text-megapayer-muted hover:text-megapayer-accent transition-all duration-300 hover:scale-110 hover:bg-megapayer-panel-soft rounded-xl"
                        title="Remove account"
                      >
                        <CustomIcons.Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setShowCreateAccount(true)}
              className="flex items-center gap-4 p-6 megapayer-panel-soft hover:bg-megapayer-panel border border-megapayer-border-soft hover:border-megapayer-border rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald rounded-xl flex items-center justify-center shadow-lg">
                <CustomIcons.Plus className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-megapayer-text text-lg">Create New Account</p>
                <p className="text-sm text-megapayer-muted">Generate a new wallet account</p>
              </div>
            </button>
            
            <button
              onClick={() => setShowImportAccount(true)}
              className="flex items-center gap-4 p-6 megapayer-panel-soft hover:bg-megapayer-panel border border-megapayer-border-soft hover:border-megapayer-border rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-accent to-megapayer-violet rounded-xl flex items-center justify-center shadow-lg">
                <CustomIcons.Key className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-megapayer-text text-lg">Import Account</p>
                <p className="text-sm text-megapayer-muted">Import from private key, seed phrase, or backup</p>
              </div>
            </button>
          </div>
        </div>

        {/* Wallet Actions */}
        <div className="megapayer-panel p-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-megapayer-violet to-megapayer-teal rounded-xl flex items-center justify-center shadow-lg">
              <CustomIcons.Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-megapayer-text font-heading">Wallet Actions</h2>
              <p className="text-megapayer-muted">Export wallet data and security options</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={handleExportWallet}
              className="flex items-center gap-4 p-6 megapayer-panel-soft hover:bg-megapayer-panel border border-megapayer-border-soft hover:border-megapayer-border rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald rounded-xl flex items-center justify-center shadow-lg">
                <CustomIcons.Download className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-megapayer-text text-lg">Export Wallet</p>
                <p className="text-sm text-megapayer-muted">Download wallet data</p>
              </div>
            </button>
            
            <button
              onClick={lock}
              className="flex items-center gap-4 p-6 megapayer-panel-soft hover:bg-megapayer-panel border border-megapayer-border-soft hover:border-megapayer-border rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-xl flex items-center justify-center shadow-lg">
                <CustomIcons.Shield className="h-6 w-6 text-megapayer-muted" />
              </div>
              <div className="text-left">
                <p className="font-bold text-megapayer-text text-lg">Lock Wallet</p>
                <p className="text-sm text-megapayer-muted">Secure your wallet</p>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="megapayer-panel p-8 animate-fade-in-up border-2 border-megapayer-accent/20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-megapayer-accent to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <CustomIcons.Trash2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-megapayer-accent font-heading">Danger Zone</h2>
              <p className="text-megapayer-muted">Irreversible actions that affect your wallet</p>
            </div>
          </div>
          
          <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-accent/20 bg-megapayer-accent/5">
            <div className="flex items-start gap-4">
              <CustomIcons.AlertTriangle className="h-5 w-5 text-megapayer-accent mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-megapayer-text mb-2">Delete Wallet</h3>
                <p className="text-sm text-megapayer-muted mb-4">
                  This will permanently delete your wallet and all associated data. This action cannot be undone.
                </p>
                <button
                  onClick={handleDeleteWallet}
                  className="px-6 py-3 bg-megapayer-accent text-white rounded-xl hover:bg-red-600 transition-all duration-300 font-semibold hover:scale-105"
                >
                  Delete Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PIN Protection Modal */}
      <PinProtection
        isOpen={showPinProtection}
        onClose={() => {
          setShowPinProtection(false);
          setPinAction(null);
        }}
        onSuccess={handlePinSuccess}
        title={pinAction === 'privateKey' ? 'View Private Key' : 'View Seed Phrase'}
        description={pinAction === 'privateKey' 
          ? 'Enter your wallet password to view your private key' 
          : 'Enter your wallet password to view your seed phrase'
        }
      />

      {/* Create Account Modal */}
      {showCreateAccount && (
        <div className="fixed inset-0 bg-gradient-to-br from-megapayer-accent/20 via-megapayer-violet/10 to-megapayer-teal/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="megapayer-panel max-w-md w-full p-8 animate-scale-in relative border border-megapayer-border/50 backdrop-blur-xl bg-white/95 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-megapayer-accent/10 to-megapayer-violet/5 rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br from-megapayer-teal/10 to-megapayer-emerald/5 rounded-full"></div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald rounded-xl flex items-center justify-center shadow-lg">
                  <CustomIcons.Plus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-megapayer-text font-heading">Create New Account</h3>
              </div>
              <button
                onClick={() => setShowCreateAccount(false)}
                className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
              >
                <CustomIcons.X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-megapayer-text mb-3">
                  Account Name
                </label>
                <input
                  type="text"
                  value={createAccountData.name}
                  onChange={(e) => setCreateAccountData({ name: e.target.value })}
                  placeholder={`Account ${accounts.length + 1}`}
                  className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border-soft rounded-xl focus:outline-none focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal/50 text-megapayer-text"
                />
              </div>
              
              <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                <div className="flex items-center gap-3 mb-2">
                  <CustomIcons.AlertTriangle className="h-5 w-5 text-megapayer-teal" />
                  <p className="font-semibold text-megapayer-text">Important</p>
                </div>
                <p className="text-sm text-megapayer-muted">
                  A new account will be created from your existing seed phrase. This account will be derived using the next available index.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8 relative z-10">
              <button
                onClick={() => setShowCreateAccount(false)}
                className="flex-1 px-4 py-3 text-megapayer-muted megapayer-panel-soft rounded-xl hover:bg-megapayer-panel transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAccount}
                className="flex-1 px-4 py-3 megapayer-btn-primary rounded-xl font-semibold hover:scale-105 transition-all duration-300"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Account Modal */}
      {showImportAccount && (
        <div className="fixed inset-0 bg-gradient-to-br from-megapayer-accent/20 via-megapayer-violet/10 to-megapayer-teal/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="megapayer-panel max-w-md w-full p-8 animate-scale-in relative border border-megapayer-border/50 backdrop-blur-xl bg-white/95 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-megapayer-accent/10 to-megapayer-violet/5 rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br from-megapayer-teal/10 to-megapayer-emerald/5 rounded-full"></div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-megapayer-accent to-megapayer-violet rounded-xl flex items-center justify-center shadow-lg">
                  <CustomIcons.Key className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-megapayer-text font-heading">Import Account</h3>
              </div>
              <button
                onClick={() => setShowImportAccount(false)}
                className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
              >
                <CustomIcons.X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-megapayer-text mb-3">
                  Import Type
                </label>
                <select
                  value={importAccountData.importType}
                  onChange={(e) => setImportAccountData(prev => ({ 
                    ...prev, 
                    importType: e.target.value as 'privateKey' | 'mnemonic' | 'backup',
                    privateKey: ''
                  }))}
                  className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border-soft rounded-xl focus:outline-none focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal/50 text-megapayer-text"
                >
                  <option value="privateKey">Private Key</option>
                  <option value="mnemonic">Seed Phrase</option>
                  <option value="backup">Backup File</option>
                </select>
              </div>

              {importAccountData.importType === 'backup' && (
                <div>
                  <label className="block text-sm font-semibold text-megapayer-text mb-3">
                    Backup File
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border-soft rounded-xl focus:outline-none focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal/50 text-megapayer-text"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-megapayer-text mb-3">
                  {importAccountData.importType === 'privateKey' ? 'Private Key' : 
                   importAccountData.importType === 'mnemonic' ? 'Seed Phrase' : 'Data'}
                </label>
                <textarea
                  value={importAccountData.privateKey}
                  onChange={(e) => setImportAccountData(prev => ({ ...prev, privateKey: e.target.value }))}
                  placeholder={
                    importAccountData.importType === 'privateKey' ? 'Enter private key (0x...)' :
                    importAccountData.importType === 'mnemonic' ? 'Enter seed phrase (12 or 24 words)' :
                    'Data will be loaded from file'
                  }
                  rows={4}
                  className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border-soft rounded-xl focus:outline-none focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal/50 text-megapayer-text"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-megapayer-text mb-3">
                  Account Name
                </label>
                <input
                  type="text"
                  value={importAccountData.name}
                  onChange={(e) => setImportAccountData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Imported Account"
                  className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border-soft rounded-xl focus:outline-none focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal/50 text-megapayer-text"
                />
              </div>
              
              <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                <div className="flex items-center gap-3 mb-2">
                  <CustomIcons.AlertTriangle className="h-5 w-5 text-megapayer-accent" />
                  <p className="font-semibold text-megapayer-text">Warning</p>
                </div>
                <p className="text-sm text-megapayer-muted">
                  {importAccountData.importType === 'mnemonic' || importAccountData.importType === 'backup'
                    ? 'Importing a seed phrase will replace your current wallet. Make sure you have backed up your current wallet first.'
                    : 'Only import accounts from trusted sources. Never share your private keys.'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8 relative z-10">
              <button
                onClick={() => setShowImportAccount(false)}
                className="flex-1 px-4 py-3 text-megapayer-muted megapayer-panel-soft rounded-xl hover:bg-megapayer-panel transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleImportAccount}
                className="flex-1 px-4 py-3 megapayer-btn-primary rounded-xl font-semibold hover:scale-105 transition-all duration-300"
              >
                Import Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Private Key Modal */}
      {showPrivateKeyModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-megapayer-accent/20 via-megapayer-violet/10 to-megapayer-teal/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="megapayer-panel max-w-md w-full p-8 animate-scale-in relative border border-megapayer-border/50 backdrop-blur-xl bg-white/95 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-megapayer-accent/10 to-megapayer-violet/5 rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br from-megapayer-teal/10 to-megapayer-emerald/5 rounded-full"></div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-megapayer-accent to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CustomIcons.Key className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-megapayer-text font-heading">Private Key</h3>
              </div>
              <button
                onClick={() => setShowPrivateKeyModal(null)}
                className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
              >
                <CustomIcons.X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-accent/20 bg-megapayer-accent/5">
                <div className="flex items-center gap-3 mb-2">
                  <CustomIcons.AlertTriangle className="h-5 w-5 text-megapayer-accent" />
                  <p className="font-semibold text-megapayer-text">Security Warning</p>
                </div>
                <p className="text-sm text-megapayer-muted">
                  Never share your private key with anyone. Anyone with access to this key can control your account.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-megapayer-text mb-3">
                  Private Key
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={showPrivateKeyModal}
                    readOnly
                    className="flex-1 px-4 py-3 megapayer-panel-soft border border-megapayer-border-soft rounded-xl font-mono text-sm text-megapayer-text"
                  />
                  <button
                    onClick={() => handleCopy(showPrivateKeyModal, 'privateKey')}
                    className="p-3 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
                  >
                    {copied === 'privateKey' ? <CustomIcons.CheckCircle className="h-5 w-5 text-megapayer-emerald" /> : <CustomIcons.Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8 relative z-10">
              <button
                onClick={() => setShowPrivateKeyModal(null)}
                className="flex-1 px-4 py-3 megapayer-panel-soft text-megapayer-text rounded-xl hover:bg-megapayer-panel transition-all duration-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}