'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { Layout } from '@/components/layout/Layout';
import { PinProtection } from '@/components/PinProtection';
import { 
  User, 
  Key, 
  Download, 
  Upload, 
  Shield, 
  Copy, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Plus,
  Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccountPage() {
  const router = useRouter();
  const {
    address,
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

  // Redirect to unlock page if wallet is locked
  useEffect(() => {
    if (!isUnlocked) {
      router.push('/unlock');
    }
  }, [isUnlocked, router]);

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
        if (typeof wallet.getPrivateKey !== 'function' || typeof wallet.getMnemonicPhrase !== 'function') {
          alert('Wallet export methods not available. Please try refreshing the page.');
          return;
        }

        const privateKey = wallet.getPrivateKey();
        const mnemonic = wallet.getMnemonicPhrase();
        
        const exportData = {
          address: address,
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

      if (importAccountData.importType === 'privateKey') {
        // Import individual account with private key
        const newAccount = await importAccount({
          privateKey: importAccountData.privateKey.trim(),
          name: importAccountData.name || 'Imported Account'
        });
        
        // Switch to the new account
        switchAccount(newAccount.address);
      } else if (importAccountData.importType === 'mnemonic') {
        // Import wallet with mnemonic (this will replace the current wallet)
        await importWallet(importAccountData.privateKey.trim());
      } else if (importAccountData.importType === 'backup') {
        // Handle backup file import
        // For now, treat as mnemonic
        await importWallet(importAccountData.privateKey.trim());
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
  if (!isUnlocked) {
    return (
      <Layout title="Account Management" subtitle="Manage your wallet account and settings">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting to unlock page...</h1>
          <p className="text-gray-600">
            Please wait while we redirect you to unlock your wallet.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Account Management" subtitle="Manage your wallet account and security settings">
      <div className="space-y-8 animate-fade-in-up">
        {/* Account Overview */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-scale-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Account Overview</h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
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
                  onClick={() => getBalance()}
                  disabled={isLoading}
                  className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50"
                  title="Refresh balance"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Information */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-scale-in delay-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Security Information</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">Important Security Notice</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Never share your private key or seed phrase with anyone. These provide full access to your wallet.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Private Key</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono bg-gray-100 p-3 rounded-lg break-all flex-1">
                    {showPrivateKey ? (wallet && typeof wallet.getPrivateKey === 'function' ? wallet.getPrivateKey() : 'Not available') : '••••••••••••••••'}
                  </p>
                  <button
                    onClick={showPrivateKey ? () => setShowPrivateKey(false) : handleShowPrivateKey}
                    className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                    title={showPrivateKey ? 'Hide private key' : 'Show private key'}
                  >
                    {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleCopy('0x1234...5678', 'privateKey')}
                    className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                    title="Copy private key"
                  >
                    {copied === 'privateKey' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seed Phrase</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono bg-gray-100 p-3 rounded-lg break-all flex-1">
                    {showSeedPhrase ? (wallet && typeof wallet.getMnemonicPhrase === 'function' ? wallet.getMnemonicPhrase() : 'Not available') : '••••••••••••••••'}
                  </p>
                  <button
                    onClick={showSeedPhrase ? () => setShowSeedPhrase(false) : handleShowSeedPhrase}
                    className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                    title={showSeedPhrase ? 'Hide seed phrase' : 'Show seed phrase'}
                  >
                    {showSeedPhrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleCopy('word1 word2 word3...', 'seedPhrase')}
                    className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                    title="Copy seed phrase"
                  >
                    {copied === 'seedPhrase' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Management */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-scale-in delay-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Account Management</h2>
            </div>
            <div className="text-sm text-gray-500">
              {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Error Display */}
          {(error || accountError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-600 font-medium">{error || accountError}</p>
              </div>
            </div>
          )}

          {/* Accounts List */}
          <div className="space-y-3 mb-6">
            {accounts.map((account, index) => (
              <div
                key={account.address}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  currentAccount?.address === account.address
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    currentAccount?.address === account.address
                      ? 'bg-blue-600'
                      : 'bg-gray-400'
                  }`}>
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-sm text-gray-500 font-mono">
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </p>
                    {account.isImported && (
                      <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full mt-1">
                        Imported
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentAccount?.address !== account.address && (
                    <button
                      onClick={() => handleSwitchAccount(account.address)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Switch
                    </button>
                  )}
                  {currentAccount?.address === account.address && (
                    <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg font-medium">
                      Active
                    </span>
                  )}
                  {accounts.length > 1 && (
                    <button
                      onClick={() => handleRemoveAccount(account.address)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove account"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowCreateAccount(true)}
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-blue-900">Create New Account</p>
                <p className="text-sm text-blue-700">Generate a new wallet account</p>
              </div>
            </button>
            
            <button
              onClick={() => setShowImportAccount(true)}
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
            >
              <Key className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-green-900">Import Account</p>
                <p className="text-sm text-green-700">Import from private key, seed phrase, or backup</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Wallet Actions */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-scale-in delay-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Key className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Wallet Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleExportWallet}
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <Download className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-blue-900">Export Wallet</p>
                <p className="text-sm text-blue-700">Download wallet data</p>
              </div>
            </button>
            
            <button
              onClick={lock}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
            >
              <Shield className="h-5 w-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Lock Wallet</p>
                <p className="text-sm text-gray-700">Secure your wallet</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-red-200 p-6 animate-scale-in delay-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
          </div>
          
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Delete Wallet</h3>
                <p className="text-sm text-red-700 mt-1">
                  This will permanently delete your wallet and all associated data. This action cannot be undone.
                </p>
                <button
                  onClick={handleDeleteWallet}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Wallet
                </button>
              </div>
            </div>
          </div>
        </motion.div>
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
          ? 'Enter your PIN to view your private key' 
          : 'Enter your PIN to view your seed phrase'
        }
      />

      {/* Create Account Modal */}
      {showCreateAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create New Account</h3>
              <button
                onClick={() => setShowCreateAccount(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <AlertCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={createAccountData.name}
                  onChange={(e) => setCreateAccountData({ name: e.target.value })}
                  placeholder={`Account ${accounts.length + 1}`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <p className="font-medium text-blue-900">Important</p>
                </div>
                <p className="text-sm text-blue-800">
                  A new account will be created from your existing seed phrase. This account will be derived using the next available index.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateAccount(false)}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAccount}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Account
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Import Account Modal */}
      {showImportAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Import Account</h3>
              <button
                onClick={() => setShowImportAccount(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <AlertCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Import Type
                </label>
                <select
                  value={importAccountData.importType}
                  onChange={(e) => setImportAccountData(prev => ({ 
                    ...prev, 
                    importType: e.target.value as 'privateKey' | 'mnemonic' | 'backup',
                    privateKey: ''
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="privateKey">Private Key</option>
                  <option value="mnemonic">Seed Phrase</option>
                  <option value="backup">Backup File</option>
                </select>
              </div>

              {importAccountData.importType === 'backup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup File
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={importAccountData.name}
                  onChange={(e) => setImportAccountData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Imported Account"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="font-medium text-yellow-900">Warning</p>
                </div>
                <p className="text-sm text-yellow-800">
                  {importAccountData.importType === 'mnemonic' || importAccountData.importType === 'backup'
                    ? 'Importing a seed phrase will replace your current wallet. Make sure you have backed up your current wallet first.'
                    : 'Only import accounts from trusted sources. Never share your private keys.'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowImportAccount(false)}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportAccount}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Import Account
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Private Key Modal */}
      {showPrivateKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Private Key</h3>
              <button
                onClick={() => setShowPrivateKeyModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <AlertCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="font-medium text-red-900">Security Warning</p>
                </div>
                <p className="text-sm text-red-800">
                  Never share your private key with anyone. Anyone with access to this key can control your account.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Private Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={showPrivateKeyModal}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => handleCopy(showPrivateKeyModal, 'privateKey')}
                    className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copied === 'privateKey' ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPrivateKeyModal(null)}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
