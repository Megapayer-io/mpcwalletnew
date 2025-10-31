'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Beautiful SVG Graphic for Setup Page
const SetupWalletIcon = () => (
  <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="setupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <filter id="glowSetup">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Glow */}
    <circle cx="120" cy="120" r="110" fill="rgba(34, 225, 255, 0.08)" />
    
    {/* Wallet Card */}
    <motion.rect
      x="40"
      y="60"
      width="160"
      height="100"
      rx="16"
      fill="none"
      stroke="url(#setupGradient)"
      strokeWidth="4"
      filter="url(#glowSetup)"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    />
    
    {/* Card Inner */}
    <rect x="48" y="68" width="144" height="84" rx="12" fill="rgba(0, 0, 0, 0.2)" />
    
    {/* Card Lines */}
    <motion.line
      x1="60"
      y1="85"
      x2="180"
      y2="85"
      stroke="#22E1FF"
      strokeWidth="2"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    />
    <motion.line
      x1="60"
      y1="105"
      x2="160"
      y2="105"
      stroke="#7C3AED"
      strokeWidth="2"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    />
    <motion.line
      x1="60"
      y1="125"
      x2="140"
      y2="125"
      stroke="#34D399"
      strokeWidth="2"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.7, duration: 0.6 }}
    />
    
    {/* Plus Icon - Create */}
    <motion.circle
      cx="90"
      cy="180"
      r="24"
      fill="url(#setupGradient)"
      opacity="0.9"
      filter="url(#glowSetup)"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.9, type: "spring" }}
    />
    <path d="M90 170 L90 190 M80 180 L100 180" stroke="white" strokeWidth="3" strokeLinecap="round" />
    
    {/* Download Icon - Import */}
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.5 }}
    >
      <circle cx="150" cy="180" r="24" fill="rgba(34, 225, 255, 0.2)" stroke="#22E1FF" strokeWidth="3" />
      <path d="M150 165 L150 185 M145 175 L150 165 L155 175" stroke="#22E1FF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </motion.g>
    
    {/* Floating Particles */}
    {[...Array(8)].map((_, i) => {
      const angle = (i * 45) * Math.PI / 180;
      const radius = 95;
      const x = 120 + Math.cos(angle) * radius;
      const y = 120 + Math.sin(angle) * radius;
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
            delay: 1.3 + i * 0.1,
            duration: 2,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

export default function SetupPage() {
  const router = useRouter();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  
  const { createWallet, isInitialized, hasWallet } = useWalletStore();

  useEffect(() => {
    if (isInitialized && hasWallet) {
      router.push('/');
    }
  }, [isInitialized, hasWallet, router]);

  const handleCreateWallet = async () => {
    setIsCreatingWallet(true);
    try {
      const result = await createWallet();
      router.push(`/setup/backup?mnemonic=${encodeURIComponent(result.mnemonic)}`);
    } catch (error) {
      console.error('Failed to create wallet:', error);
      alert('Failed to create wallet. Please try again.');
    } finally {
      setIsCreatingWallet(false);
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
          <p className="text-megapayer-muted font-semibold font-body">Initializing wallet...</p>
        </div>
      </div>
    );
  }

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

      {/* Header with Back Button */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 relative z-10">
        {/* Beautiful SVG Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <SetupWalletIcon />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold font-heading text-megapayer-text mb-3">
            Wallet Setup
          </h1>
          <p className="text-base font-body text-megapayer-muted max-w-sm">
            Choose how you want to set up your wallet
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full max-w-md space-y-3"
        >
          {/* Import Button */}
          <Link href="/setup/import" className="block w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-4 megapayer-panel-soft border border-megapayer-border rounded-2xl text-megapayer-text font-semibold font-heading hover:bg-megapayer-panel transition-all duration-300 flex items-center justify-center gap-3 shadow-megapayer"
            >
              <CustomIcons.Download className="w-5 h-5 text-megapayer-teal" />
              <span>Import Using Seed Phrase</span>
            </motion.button>
          </Link>

          {/* Create Button */}
          <motion.button
            onClick={handleCreateWallet}
            disabled={isCreatingWallet}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-4 megapayer-btn-primary rounded-2xl font-bold font-heading transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-megapayer"
          >
            {isCreatingWallet ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Wallet...</span>
              </>
            ) : (
              <>
                <CustomIcons.Plus className="w-5 h-5" />
                <span>Create a New Wallet</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
