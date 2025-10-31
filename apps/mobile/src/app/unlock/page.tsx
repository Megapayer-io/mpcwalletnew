'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { motion } from 'framer-motion';

// Beautiful SVG Graphic for Unlock Page
const UnlockIcon = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="unlockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <filter id="glowUnlock">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Circle */}
    <circle cx="100" cy="100" r="90" fill="rgba(34, 225, 255, 0.05)" />
    
    {/* Lock Body */}
    <motion.rect
      x="60"
      y="90"
      width="80"
      height="70"
      rx="8"
      fill="none"
      stroke="url(#unlockGradient)"
      strokeWidth="5"
      filter="url(#glowUnlock)"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
    />
    
    {/* Lock Shackle - Open */}
    <motion.path
      d="M75 90 Q75 70 100 65 Q125 70 125 90"
      fill="none"
      stroke="url(#unlockGradient)"
      strokeWidth="5"
      strokeLinecap="round"
      filter="url(#glowUnlock)"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    />
    
    {/* Keyhole */}
    <motion.circle
      cx="100"
      cy="115"
      r="14"
      fill="none"
      stroke="url(#unlockGradient)"
      strokeWidth="3"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.6, type: "spring" }}
    />
    
    {/* Unlocking Rays */}
    {[0, 1, 2, 3].map((i) => {
      const angle = (i * 90) * Math.PI / 180;
      const radius = 55;
      const x = 100 + Math.cos(angle) * radius;
      const y = 100 + Math.sin(angle) * radius;
      return (
        <motion.path
          key={i}
          d={`M100 100 L${x} ${y}`}
          stroke="#22E1FF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{
            delay: 1 + i * 0.1,
            duration: 0.5
          }}
        />
      );
    })}
    
    {/* Floating Particles */}
    {[...Array(8)].map((_, i) => {
      const angle = (i * 45) * Math.PI / 180;
      const radius = 75;
      const x = 100 + Math.cos(angle) * radius;
      const y = 100 + Math.sin(angle) * radius;
      return (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="3"
          fill="#7C3AED"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0]
          }}
          transition={{
            delay: 1.2 + i * 0.1,
            duration: 2,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

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
    unlock
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
      setError(error instanceof Error ? error.message : 'Incorrect password');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen megapayer-bg flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-megapayer-teal border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-megapayer-muted font-semibold font-body">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!hasWallet) {
    return (
      <div className="min-h-screen megapayer-bg flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <h2 className="text-2xl font-bold font-heading text-megapayer-text mb-2">No Wallet Found</h2>
          <p className="text-megapayer-muted mb-6 font-body">Please create or import a wallet first.</p>
          <motion.button
            onClick={() => router.push('/setup')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 megapayer-btn-primary rounded-2xl font-bold font-heading"
          >
            Go to Setup
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen megapayer-bg flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-10"
          style={{
            background: `linear-gradient(135deg, rgba(34,225,255,0.3), rgba(124,58,237,0.2))`
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

      {/* Main Content */}
      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Unlock Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <UnlockIcon />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold font-heading text-megapayer-text mb-2">
            Unlock Wallet
          </h1>
          <p className="text-sm font-body text-megapayer-muted">
            Enter your password to continue
          </p>
        </motion.div>

        {/* Password Form */}
        <motion.form
          onSubmit={handleUnlock}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-5"
        >
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password"
                className="w-full px-4 py-4 megapayer-panel-soft border border-megapayer-border rounded-2xl text-megapayer-text font-body placeholder-megapayer-muted focus:ring-2 focus:ring-megapayer-teal focus:border-transparent transition-all text-lg"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-megapayer-muted hover:text-megapayer-text transition-colors"
              >
                {showPassword ? (
                  <CustomIcons.EyeOff className="w-5 h-5" />
                ) : (
                  <CustomIcons.Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 megapayer-panel-soft border border-red-500/50 rounded-xl"
            >
              <p className="text-sm font-body text-red-400 text-center">{error}</p>
            </motion.div>
          )}

          {/* Unlock Button */}
          <motion.button
            type="submit"
            disabled={isLoading || !password.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 megapayer-btn-primary rounded-2xl font-bold font-heading shadow-megapayer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Unlocking...</span>
              </>
            ) : (
              <>
                <CustomIcons.Zap className="w-5 h-5" />
                <span>Unlock</span>
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
