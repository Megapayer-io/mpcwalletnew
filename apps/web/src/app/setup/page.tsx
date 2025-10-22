'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { SetupLayout } from '@/components/layout/SetupLayout';
import { SeedBackup } from '@/components/SeedBackup';
import { Wallet, Plus, Download, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';

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
  
  const { createWallet, importWallet, isInitialized, hasWallet } = useWalletStore();

  useEffect(() => {
    if (isInitialized && hasWallet) {
      router.push('/');
    }
  }, [isInitialized, hasWallet, router]);

  const handleCreateWallet = async () => {
    try {
      const result = await createWallet();
      setMnemonic(result.mnemonic);
      setStep('backup');
    } catch (error) {
      console.error('Failed to create wallet:', error);
    }
  };

  const handleImportWallet = async () => {
    if (!importMnemonic.trim()) {
      alert('Please enter a valid seed phrase');
      return;
    }

    try {
      await importWallet(importMnemonic.trim());
      setStep('password');
    } catch (error) {
      console.error('Failed to import wallet:', error);
      alert('Invalid seed phrase. Please check and try again.');
    }
  };

  const handleBackupComplete = () => {
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      // In a real implementation, you would encrypt the wallet with the password
      // For now, we'll just redirect to the dashboard
      router.push('/');
    } catch (error) {
      console.error('Failed to set password:', error);
    }
  };

  if (step === 'backup') {
    return (
      <SetupLayout title="Backup Your Wallet" subtitle="Save your seed phrase securely">
        <SeedBackup mnemonic={mnemonic} onComplete={handleBackupComplete} />
      </SetupLayout>
    );
  }

  if (step === 'password') {
    return (
      <SetupLayout title="Set Password" subtitle="Create a strong password to secure your wallet">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Password</h2>
              <p className="text-gray-600">
                Create a strong password to encrypt your wallet. This password will be required to unlock your wallet.
              </p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-1">Password Requirements</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Mix of uppercase and lowercase letters</li>
                      <li>• Include numbers and special characters</li>
                      <li>• Don't use common words or personal information</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Complete Setup
              </button>
            </form>
          </div>
        </div>
      </SetupLayout>
    );
  }

  return (
    <SetupLayout title="Welcome to MPC Wallet" subtitle="Create a new wallet or import an existing one">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create New Wallet */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Wallet</h2>
            <p className="text-gray-600 mb-6">
              Generate a new wallet with a unique seed phrase. Make sure to backup your seed phrase securely.
            </p>
            <button
              onClick={handleCreateWallet}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Create New Wallet
            </button>
          </div>
        </div>

        {/* Import Existing Wallet */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Import Existing Wallet</h2>
            <p className="text-gray-600 mb-6">
              Import your existing wallet using your 12 or 24-word seed phrase.
            </p>
            
            {!isImportMode ? (
              <button
                onClick={() => setIsImportMode(true)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Import Wallet
              </button>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={importMnemonic}
                  onChange={(e) => setImportMnemonic(e.target.value)}
                  placeholder="Enter your seed phrase (12 or 24 words)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setIsImportMode(false);
                      setImportMnemonic('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportWallet}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Import
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Security Notice</h3>
            <div className="text-yellow-700 text-sm space-y-2">
              <p>
                <strong>Never share your seed phrase:</strong> Anyone with access to your seed phrase can control your wallet and steal your funds.
              </p>
              <p>
                <strong>Store it securely:</strong> Write it down on paper and store it in a safe place. Never store it digitally or share it online.
              </p>
              <p>
                <strong>Verify your backup:</strong> Make sure you can restore your wallet using your seed phrase before deleting any backups.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SetupLayout>
  );
}