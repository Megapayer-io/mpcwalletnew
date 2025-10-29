'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function UnlockPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    isInitialized, 
    hasWallet, 
    isUnlocked, 
    unlock,
    address,
    currentNetwork,
    resetWallet
  } = useWalletStore();

  useEffect(() => {
    if (isInitialized && !hasWallet) {
      router.push('/setup');
      return;
    }
    
    if (isInitialized && hasWallet && isUnlocked) {
      router.push('/');
      return;
    }
  }, [isInitialized, hasWallet, isUnlocked, router]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await unlock(password);
      router.push('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to unlock wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetWallet = () => {
    if (confirm('Are you sure you want to reset your wallet? This will delete all your data and you will need to create a new wallet or import your seed phrase again.')) {
      resetWallet();
      router.push('/setup');
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen megapayer-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-megapayer-teal via-megapayer-violet to-megapayer-accent rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
            <Image
              src="/megapayer-logo.svg"
              alt="Megapayer Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal mx-auto mb-4"></div>
          <p className="text-megapayer-muted font-semibold">Initializing wallet...</p>
        </div>
      </div>
    );
  }

  if (!hasWallet) {
    return (
      <div className="min-h-screen megapayer-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-megapayer-teal via-megapayer-violet to-megapayer-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Image
              src="/megapayer-logo.svg"
              alt="Megapayer Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
          <h2 className="text-2xl font-bold text-megapayer-text mb-2">No Wallet Found</h2>
          <p className="text-megapayer-muted mb-6">Please create or import a wallet first.</p>
          <button
            onClick={() => router.push('/setup')}
            className="px-6 py-3 megapayer-btn-primary rounded-lg hover:scale-105 transition-all duration-300"
          >
            Go to Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen megapayer-bg flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-megapayer-teal via-megapayer-violet to-megapayer-accent rounded-xl flex items-center justify-center mx-auto mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Image
              src="/megapayer-logo.svg"
              alt="Megapayer Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </motion.div>
          
          <motion.h1
            className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Welcome Back
          </motion.h1>
          
          <motion.p
            className="text-gray-600 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Unlock your Megapayer wallet to continue
          </motion.p>
        </div>

        {/* Unlock Form */}
        <motion.div
          className="megapayer-panel backdrop-blur-xl rounded-xl shadow-md border border-megapayer-border p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-lg flex items-center justify-center mx-auto mb-3">
              <CustomIcons.Lock className="w-6 h-6 text-megapayer-muted" />
            </div>
            <h2 className="text-xl font-bold text-megapayer-text mb-1">Unlock Wallet</h2>
            <p className="text-megapayer-muted text-sm">
              Enter your password to access your wallet
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-megapayer-text mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-megapayer-border rounded-lg focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal/50 bg-megapayer-panel/50 backdrop-blur-sm transition-all duration-300 text-megapayer-text placeholder-megapayer-muted"
                  placeholder="Enter your password"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-megapayer-muted hover:text-megapayer-text transition-colors"
                >
                  {showPassword ? <CustomIcons.EyeOff className="w-4 h-4" /> : <CustomIcons.Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-2">
                  <CustomIcons.AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full megapayer-btn-primary py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Unlocking...</span>
                </>
              ) : (
                <>
                  <CustomIcons.Zap className="w-4 h-4" />
                  <span>Unlock Wallet</span>
                  <CustomIcons.ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Wallet Info */}
          {address && (
            <div className="mt-4 p-3 megapayer-panel-soft rounded-lg border border-megapayer-border-soft">
              <div className="flex items-center space-x-2 mb-1">
                <CustomIcons.Shield className="w-3 h-3 text-megapayer-muted" />
                <span className="text-xs font-medium text-megapayer-text">Wallet Address</span>
              </div>
              <p className="text-xs font-mono text-megapayer-text break-all">
                {address}
              </p>
              {currentNetwork && (
                <p className="text-xs text-megapayer-muted mt-1">
                  Network: {currentNetwork.name}
                </p>
              )}
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-4 p-3 megapayer-panel-soft border border-megapayer-border-soft rounded-lg">
            <div className="flex items-start space-x-2">
              <CustomIcons.Shield className="w-3 h-3 text-megapayer-teal mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-xs font-medium text-megapayer-text mb-1">Security Notice</h3>
                <p className="text-xs text-megapayer-muted">
                  Your password is never stored or transmitted. It's only used locally to decrypt your wallet.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-xs text-megapayer-muted">
            Having trouble?{' '}
            <button
              onClick={handleResetWallet}
              className="text-megapayer-teal hover:text-megapayer-violet font-medium transition-colors"
            >
              Reset your wallet
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
