'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { motion } from 'framer-motion';

// Beautiful SVG Graphic for Import Page
const ImportIcon = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="importGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <filter id="glowImport">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background */}
    <circle cx="100" cy="100" r="90" fill="rgba(34, 225, 255, 0.05)" />
    
    {/* Download Arrow */}
    <motion.g
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <circle cx="100" cy="80" r="35" fill="rgba(34, 225, 255, 0.2)" stroke="url(#importGradient)" strokeWidth="3" filter="url(#glowImport)" />
      <path d="M100 65 L100 85 M92 77 L100 65 L108 77" stroke="url(#importGradient)" strokeWidth="3" strokeLinecap="round" fill="none" />
    </motion.g>
    
    {/* Seed Phrase Container */}
    <motion.rect
      x="30"
      y="130"
      width="140"
      height="50"
      rx="12"
      fill="none"
      stroke="url(#importGradient)"
      strokeWidth="3"
      filter="url(#glowImport)"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    />
    
    {/* Word Lines */}
    {[0, 1, 2].map((i) => (
      <motion.line
        key={i}
        x1="45"
        y1={145 + i * 15}
        x2="155"
        y2={145 + i * 15}
        stroke="#22E1FF"
        strokeWidth="2"
        strokeDasharray="3,3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
      />
    ))}
    
    {/* Security Lock */}
    <motion.path
      d="M140 50 L150 45 L150 55 Q150 60 145 62 Q140 60 140 55 Z"
      fill="none"
      stroke="#34D399"
      strokeWidth="2.5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    />
    
    {/* Floating Particles */}
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
          r="2.5"
          fill="#7C3AED"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{
            delay: 1 + i * 0.1,
            duration: 2,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

export default function ImportPage() {
  const router = useRouter();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  const { importWallet, saveKeystore } = useWalletStore();

  const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!seedPhrase.trim()) {
      setError('Please enter your seed phrase');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsImporting(true);

    try {
      await importWallet(seedPhrase.trim());
      await saveKeystore(seedPhrase.trim(), password);
      router.push('/');
    } catch (error) {
      console.error('Failed to import wallet:', error);
      setError('Invalid seed phrase. Please check and try again.');
    } finally {
      setIsImporting(false);
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

      {/* Header */}
      <div className="px-5 pt-6 pb-4 relative z-10">
        <motion.button
          onClick={() => router.back()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-megapayer-muted hover:text-megapayer-text transition-colors"
        >
          <CustomIcons.ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-semibold font-heading">Back</span>
        </motion.button>
      </div>

      {/* Title with Icon */}
      <div className="px-5 pb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="flex-shrink-0">
            <ImportIcon />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading text-megapayer-text mb-2">
              Import From Seed
            </h1>
            <p className="text-sm font-body text-megapayer-muted">
              Enter your seed phrase to restore your wallet
            </p>
          </div>
        </motion.div>
      </div>

      {/* Form */}
      <form onSubmit={handleImport} className="flex-1 flex flex-col px-5 pb-6 relative z-10">
        <div className="space-y-5">
          {/* Seed Phrase */}
          <div>
            <label className="block text-sm font-semibold font-heading text-megapayer-text mb-2">
              Seed Phrase
            </label>
            <div className="relative">
              <textarea
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                placeholder="Enter your 12 or 24 word seed phrase"
                rows={4}
                className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text font-body placeholder-megapayer-muted focus:ring-2 focus:ring-megapayer-teal focus:border-transparent resize-none transition-all"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                  className="p-2 text-megapayer-muted hover:text-megapayer-text transition-colors"
                >
                  {showSeedPhrase ? (
                    <CustomIcons.EyeOff className="w-5 h-5" />
                  ) : (
                    <CustomIcons.Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold font-heading text-megapayer-text mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
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
            <p className="text-xs font-body text-megapayer-muted mt-1.5">
              Must be at least 8 characters
            </p>
          </div>

          {/* Confirm Password */}
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
          </div>

          {/* Terms */}
          <p className="text-xs font-body text-megapayer-muted">
            By proceeding, you agree to these{' '}
            <a href="#" className="text-megapayer-teal hover:text-megapayer-violet font-semibold">
              Terms and Conditions
            </a>
            .
          </p>

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
            disabled={isImporting || !seedPhrase.trim() || !password || password !== confirmPassword}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 megapayer-btn-primary rounded-2xl font-bold font-heading shadow-megapayer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Importing...</span>
              </>
            ) : (
              'Import Wallet'
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
