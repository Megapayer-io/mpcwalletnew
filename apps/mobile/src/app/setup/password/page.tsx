'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { motion } from 'framer-motion';

// Beautiful SVG Graphic for Password Page
const PasswordLockIcon = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <filter id="glowLock">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
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
      stroke="url(#lockGradient)"
      strokeWidth="4"
      filter="url(#glowLock)"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
    />
    
    {/* Lock Shackle */}
    <motion.path
      d="M75 90 Q75 70 100 70 Q125 70 125 90"
      fill="none"
      stroke="url(#lockGradient)"
      strokeWidth="4"
      strokeLinecap="round"
      filter="url(#glowLock)"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    />
    
    {/* Keyhole */}
    <motion.circle
      cx="100"
      cy="115"
      r="12"
      fill="none"
      stroke="url(#lockGradient)"
      strokeWidth="3"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.6, type: "spring" }}
    />
    <rect x="96" y="127" width="8" height="12" rx="2" fill="url(#lockGradient)" opacity="0.8" />
    
    {/* Security Particles */}
    {[...Array(6)].map((_, i) => {
      const angle = (i * 60) * Math.PI / 180;
      const radius = 70;
      const x = 100 + Math.cos(angle) * radius;
      const y = 100 + Math.sin(angle) * radius;
      return (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="3"
          fill="#22E1FF"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0]
          }}
          transition={{
            delay: 1 + i * 0.15,
            duration: 2,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

export default function PasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mnemonic = searchParams.get('mnemonic') || '';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { saveKeystore, wallet, resetWallet } = useWalletStore();

  // Check if setup is incomplete when component mounts
  useEffect(() => {
    if (wallet && wallet.getAddress() && !wallet.hasKeystore()) {
      // Wallet was created but keystore not saved - this is expected during setup
      // But if user navigated here without mnemonic, something went wrong
      if (!mnemonic) {
        resetWallet();
        router.push('/setup');
      }
    }
  }, [wallet, mnemonic, resetWallet, router]);

  const getPasswordStrength = () => {
    if (password.length === 0) return { level: '', color: '', width: '0%' };
    if (password.length < 8) return { level: 'Weak', color: 'text-red-400', width: '33%' };
    if (password.length < 12) return { level: 'Good', color: 'text-megapayer-emerald', width: '66%' };
    return { level: 'Strong', color: 'text-megapayer-emerald', width: '100%' };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!understood) {
      setError('Please confirm you understand the risks');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveKeystore(mnemonic, password);
      router.push('/setup/success');
    } catch (error) {
      console.error('Failed to save wallet:', error);
      setError('Failed to save wallet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen megapayer-bg flex flex-col relative overflow-hidden">
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

      {/* Header with Progress */}
      <div className="px-5 pt-6 pb-4 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-megapayer-muted hover:text-megapayer-text transition-colors"
          >
            <CustomIcons.ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex gap-1">
              <div className="flex-1 h-1 rounded-full bg-megapayer-teal"></div>
              <div className="flex-1 h-1 rounded-full bg-megapayer-teal"></div>
              <div className="flex-1 h-1 rounded-full bg-megapayer-muted/40"></div>
            </div>
          </div>
          <span className="text-sm font-body text-megapayer-muted">2/3</span>
        </div>
      </div>

      {/* Title with Icon */}
      <div className="px-5 pb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="flex-shrink-0">
            <PasswordLockIcon />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading text-megapayer-text mb-2">
              Create Password
            </h1>
            <p className="text-sm font-body text-megapayer-muted">
              This password will unlock your wallet only on this device.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-5 pb-6 relative z-10">
        <div className="space-y-5">
          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold font-heading text-megapayer-text mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text font-body placeholder-megapayer-muted focus:ring-2 focus:ring-megapayer-teal focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-megapayer-muted hover:text-megapayer-text transition-colors"
              >
                {showPassword ? (
                  <CustomIcons.EyeOff className="w-5 h-5" />
                ) : (
                  <CustomIcons.Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-xs font-semibold font-body ${passwordStrength.color}`}>
                    Password strength: {passwordStrength.level}
                  </p>
                </div>
                <div className="h-1.5 bg-megapayer-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      passwordStrength.level === 'Weak' ? 'bg-red-400' : 'bg-megapayer-emerald'
                    }`}
                    initial={{ width: '0%' }}
                    animate={{ width: passwordStrength.width }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-semibold font-heading text-megapayer-text mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text font-body placeholder-megapayer-muted focus:ring-2 focus:ring-megapayer-teal focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-megapayer-muted hover:text-megapayer-text transition-colors"
              >
                {showConfirmPassword ? (
                  <CustomIcons.EyeOff className="w-5 h-5" />
                ) : (
                  <CustomIcons.Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs font-body text-megapayer-muted mt-1.5">
              Must be at least 8 characters
            </p>
          </div>

          {/* Disclaimer Checkbox */}
          <div className="flex items-start gap-3 py-2 megapayer-panel-soft rounded-xl px-4">
            <button
              type="button"
              onClick={() => setUnderstood(!understood)}
              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                understood
                  ? 'bg-megapayer-teal border-megapayer-teal'
                  : 'border-megapayer-border'
              }`}
            >
              {understood && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <label className="text-sm font-body text-megapayer-text">
              I understand that this wallet cannot recover this password for me.{' '}
              <a href="#" className="text-megapayer-teal hover:text-megapayer-violet font-semibold">
                Learn more
              </a>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 megapayer-panel-soft border border-red-500/50 rounded-xl"
            >
              <p className="text-sm font-body text-red-400">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-auto pt-6">
          <motion.button
            type="submit"
            disabled={isSubmitting || !password || !confirmPassword || !understood}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 megapayer-btn-primary rounded-2xl font-bold font-heading shadow-megapayer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Password...' : 'Create Password'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
