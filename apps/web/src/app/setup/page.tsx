'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { Header } from '@/components/Header';
import { SeedBackup } from '@/components/SeedBackup';
import { Wallet, Plus, Download, AlertCircle } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'choose' | 'backup' | 'password'>('choose');
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [isImportMode, setIsImportMode] = useState(false);
  
  const { hasWallet, createWallet, importWallet, saveKeystore, isLoading, error, clearError } = useWalletStore();

  // Redirect if wallet already exists
  useEffect(() => {
    if (hasWallet) {
      router.push('/');
    }
  }, [hasWallet, router]);

  const handleCreateWallet = async () => {
    clearError();
    try {
      const result = await createWallet();
      setMnemonic(result.mnemonic);
      setStep('backup');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleImportWallet = async () => {
    if (!importMnemonic.trim()) {
      return;
    }
    
    clearError();
    try {
      const result = await importWallet(importMnemonic.trim());
      setMnemonic(result.mnemonic);
      setStep('backup');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleBackupComplete = () => {
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }
    
    if (password.length < 8) {
      return;
    }

    clearError();
    try {
      await saveKeystore(mnemonic, password);
      router.push('/');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleDownloadMnemonic = () => {
    const content = `EVM Wallet Seed Phrase Backup\n\nIMPORTANT: Keep this safe and never share it with anyone!\n\nYour seed phrase:\n${mnemonic}\n\nGenerated on: ${new Date().toLocaleString()}\n\nThis seed phrase can be used to recover your wallet. Anyone with access to this phrase can control your funds.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evm-wallet-backup-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (step === 'backup') {
    return (
      <div className="min-h-screen">
        <Header />
        <SeedBackup mnemonic={mnemonic} onComplete={handleBackupComplete} />
      </div>
    );
  }

  if (step === 'password') {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Set Password</h2>
            <p className="text-gray-600 mb-6">
              Create a strong password to encrypt your wallet. This password will be required to unlock your wallet.
            </p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Enter a strong password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 characters
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword || password.length < 8}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Wallet...' : 'Create Wallet'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Your Wallet</h1>
          <p className="text-gray-600">
            Create a new wallet or import an existing one using your seed phrase
          </p>
        </div>

        <div className="space-y-6">
          {/* Create New Wallet */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create New Wallet</h2>
                <p className="text-gray-600">Generate a new wallet with a random seed phrase</p>
              </div>
            </div>
            
            <button
              onClick={handleCreateWallet}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create New Wallet'}
            </button>
          </div>

          {/* Import Existing Wallet */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Import Existing Wallet</h2>
                <p className="text-gray-600">Import your wallet using a 12-word seed phrase</p>
              </div>
            </div>

            {!isImportMode ? (
              <button
                onClick={() => setIsImportMode(true)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Import Wallet
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="importMnemonic" className="block text-sm font-medium text-gray-700 mb-1">
                    Seed Phrase
                  </label>
                  <textarea
                    id="importMnemonic"
                    value={importMnemonic}
                    onChange={(e) => setImportMnemonic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your 12-word seed phrase"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your 12-word seed phrase separated by spaces
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setIsImportMode(false);
                      setImportMnemonic('');
                      clearError();
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportWallet}
                    disabled={isLoading || !importMnemonic.trim()}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Importing...' : 'Import Wallet'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
