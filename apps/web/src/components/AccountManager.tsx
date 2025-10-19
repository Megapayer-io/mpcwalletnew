'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Plus, Download, Trash2, Eye, EyeOff, Copy, Check, AlertCircle } from 'lucide-react';

export function AccountManager() {
  const [showImportForm, setShowImportForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [importData, setImportData] = useState({
    privateKey: '',
    name: '',
    importType: 'privateKey' as 'privateKey' | 'mnemonic'
  });
  const [createData, setCreateData] = useState({
    name: ''
  });
  const [error, setError] = useState('');

  const {
    accounts,
    currentAccount,
    switchAccount,
    createAccount,
    importAccount,
    importWallet,
    removeAccount,
    exportPrivateKey,
    clearError,
    clearCorruptedAccounts
  } = useWalletStore();

  const handleImportAccount = async () => {
    if (!importData.privateKey.trim()) {
      setError(importData.importType === 'privateKey' ? 'Private key is required' : 'Seed phrase is required');
      return;
    }

    try {
      clearError();
      
      if (importData.importType === 'privateKey') {
        // Import individual account with private key
        await importAccount({
          privateKey: importData.privateKey.trim(),
          name: importData.name || 'Imported Account'
        });
      } else {
        // Import wallet with mnemonic (this will replace the current wallet)
        await importWallet(importData.privateKey.trim());
      }
      
      setImportData({ privateKey: '', name: '', importType: 'privateKey' });
      setShowImportForm(false);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to import account');
    }
  };

  const handleCreateAccount = async () => {
    try {
      clearError();
      createAccount({
        name: createData.name || `Account ${accounts.length + 1}`
      });
      setCreateData({ name: '' });
      setShowCreateForm(false);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account');
    }
  };

  const handleRemoveAccount = async (address: string) => {
    if (accounts.length <= 1) {
      setError('Cannot remove the last account');
      return;
    }

    if (confirm('Are you sure you want to remove this account? This action cannot be undone.')) {
      try {
        clearError();
        removeAccount(address);
        setError('');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to remove account');
      }
    }
  };

  const handleExportPrivateKey = (address: string) => {
    try {
      const privateKey = exportPrivateKey(address);
      setShowPrivateKey(privateKey);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export private key');
    }
  };

  const handleCopyPrivateKey = async () => {
    if (showPrivateKey) {
      try {
        await navigator.clipboard.writeText(showPrivateKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy private key:', error);
      }
    }
  };

  const handleSwitchAccount = (address: string) => {
    try {
      clearError();
      switchAccount(address);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to switch account');
    }
  };

  const handleClearCorruptedData = () => {
    try {
      clearError();
      clearCorruptedAccounts();
      setError('');
      // Force a page refresh to reload the wallet state
      window.location.reload();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to clear corrupted data');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Accounts</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </button>
          <button
            onClick={() => setShowImportForm(true)}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          >
            <Download className="h-4 w-4" />
            <span>Import</span>
          </button>
          <button
            onClick={handleClearCorruptedData}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            title="Clear corrupted account data from localStorage"
          >
            <span>Clear Data</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Account List */}
      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.address}
            className={`p-4 border rounded-lg ${
              currentAccount?.address === account.address
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-gray-900">{account.name}</h3>
                  {currentAccount?.address === account.address && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                      Active
                    </span>
                  )}
                  {account.isImported && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                      Imported
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-mono">
                  {account.address}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {currentAccount?.address !== account.address && (
                  <button
                    onClick={() => handleSwitchAccount(account.address)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Switch
                  </button>
                )}
                <button
                  onClick={() => handleExportPrivateKey(account.address)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Export private key"
                >
                  <Eye className="h-4 w-4" />
                </button>
                {accounts.length > 1 && (
                  <button
                    onClick={() => handleRemoveAccount(account.address)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Remove account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Import Account Modal */}
      {showImportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Account</h3>
            <div className="space-y-4">
              {/* Import Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Import Method
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setImportData(prev => ({ ...prev, importType: 'privateKey', privateKey: '' }))}
                    className={`flex-1 px-3 py-2 text-sm rounded-md border ${
                      importData.importType === 'privateKey'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Private Key
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportData(prev => ({ ...prev, importType: 'mnemonic', privateKey: '' }))}
                    className={`flex-1 px-3 py-2 text-sm rounded-md border ${
                      importData.importType === 'mnemonic'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Seed Phrase
                  </button>
                </div>
              </div>

              {/* Input Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {importData.importType === 'privateKey' ? 'Private Key' : 'Seed Phrase'}
                </label>
                <textarea
                  value={importData.privateKey}
                  onChange={(e) => setImportData(prev => ({ ...prev, privateKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                  placeholder={importData.importType === 'privateKey' ? '0x...' : 'word1 word2 word3...'}
                  rows={importData.importType === 'privateKey' ? 3 : 4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {importData.importType === 'privateKey' 
                    ? 'Enter the private key (64 hex characters)'
                    : 'Enter your 12-word seed phrase separated by spaces'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name (optional)
                </label>
                <input
                  type="text"
                  value={importData.name}
                  onChange={(e) => setImportData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Imported Account"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowImportForm(false);
                    setImportData({ privateKey: '', name: '', importType: 'privateKey' });
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportAccount}
                  disabled={!importData.privateKey.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name (optional)
                </label>
                <input
                  type="text"
                  value={createData.name}
                  onChange={(e) => setCreateData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Account ${accounts.length + 1}`}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateData({ name: '' });
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAccount}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Private Key Modal */}
      {showPrivateKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Private Key</h3>
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Never share your private key with anyone. Anyone with access to this key can control your account.
              </p>
            </div>
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-md flex-1 break-all">
                  {showPrivateKey}
                </span>
                <button
                  onClick={handleCopyPrivateKey}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Copy private key"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowPrivateKey(null)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
