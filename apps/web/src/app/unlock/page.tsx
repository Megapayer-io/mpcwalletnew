'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Wallet,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    currentNetwork 
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

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Initializing wallet...</p>
        </div>
      </div>
    );
  }

  if (!hasWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Wallet Found</h2>
          <p className="text-gray-600 mb-6">Please create or import a wallet first.</p>
          <button
            onClick={() => router.push('/setup')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Wallet className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h1
            className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Welcome Back
          </motion.h1>
          
          <motion.p
            className="text-gray-600 text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Unlock your MPC Wallet to continue
          </motion.p>
        </div>

        {/* Unlock Form */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Wallet</h2>
            <p className="text-gray-600">
              Enter your password to access your wallet
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-6">
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                className="p-4 bg-red-50 border border-red-200 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Unlocking...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Unlock Wallet</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Wallet Info */}
          {address && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Wallet Address</span>
              </div>
              <p className="text-sm font-mono text-gray-600 break-all">
                {address}
              </p>
              {currentNetwork && (
                <p className="text-xs text-gray-500 mt-1">
                  Network: {currentNetwork.name}
                </p>
              )}
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-1">Security Notice</h3>
                <p className="text-xs text-blue-700">
                  Your password is never stored or transmitted. It's only used locally to decrypt your wallet.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-sm text-gray-500">
            Having trouble?{' '}
            <button
              onClick={() => router.push('/setup')}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Reset your wallet
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
