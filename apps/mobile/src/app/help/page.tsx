'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { motion } from 'framer-motion';

// Beautiful SVG Graphics for Help & Support Page
const HelpIcon = () => (
  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="helpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <filter id="glowHelp">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Circle */}
    <circle cx="70" cy="70" r="65" fill="rgba(34, 225, 255, 0.08)" />
    
    {/* Question Mark */}
    <motion.g
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Question Mark Circle */}
      <circle cx="70" cy="70" r="35" fill="none" stroke="url(#helpGradient)" strokeWidth="4" filter="url(#glowHelp)" />
      
      {/* Question Mark */}
      <path
        d="M70 45 Q70 50 70 55 Q70 58 72 60 Q74 62 76 62 Q78 62 80 60 Q82 58 82 56 L82 52 Q82 48 78 46 Q76 45 74 45 Q70 45 70 45 Z"
        fill="none"
        stroke="url(#helpGradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M70 65 L70 85"
        stroke="url(#helpGradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="70" cy="95" r="3" fill="url(#helpGradient)" />
    </motion.g>
    
    {/* Floating Support Icons */}
    {[...Array(6)].map((_, i) => {
      const angle = (i * 60) * Math.PI / 180;
      const radius = 55;
      const x = 70 + Math.cos(angle) * radius;
      const y = 70 + Math.sin(angle) * radius;
      return (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="4"
          fill="#7C3AED"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0]
          }}
          transition={{
            delay: 0.6 + i * 0.15,
            duration: 2.5,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

export default function HelpPage() {
  const router = useRouter();
  const { isInitialized, isUnlocked } = useWalletStore();

  useEffect(() => {
    if (isInitialized && !isUnlocked) {
      router.push('/unlock');
    }
  }, [isInitialized, isUnlocked, router]);

  if (!isInitialized || !isUnlocked) {
    return null;
  }

  const handleTelegramClick = () => {
    window.open('https://t.me/megapayerchat', '_blank');
  };

  return (
    <div className="min-h-screen megapayer-bg flex flex-col relative overflow-hidden pb-24">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-8"
          style={{
            background: `linear-gradient(135deg, rgba(124,58,237,0.2), rgba(34,225,255,0.15))`
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

      {/* Header Section */}
      <div className="px-5 pt-6 pb-3 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#7C3AED15] flex-shrink-0">
            <HelpIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-heading text-megapayer-text">Help & Support</h1>
            <p className="text-sm font-body text-megapayer-muted mt-0.5">We're here to help you</p>
          </div>
        </motion.div>
      </div>

      {/* Telegram Support Card */}
      <div className="px-5 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="megapayer-panel rounded-2xl border border-megapayer-border overflow-hidden"
        >
          <div className="px-4 py-3.5 flex items-center gap-3 border-b border-megapayer-border">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#22E1FF20]">
              <CustomIcons.MessageSquare className="w-3.5 h-3.5 text-[#22E1FF]" />
            </div>
            <h2 className="text-sm font-semibold font-heading text-megapayer-text">Get Support</h2>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#0088cc15] flex-shrink-0">
                <svg className="w-6 h-6 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.108 1.134-.608 2.074-1.5 2.82-.893.747-2.06 1.12-3.5 1.12s-2.607-.373-3.5-1.12c-.892-.746-1.392-1.686-1.5-2.82-.054-.68-.027-1.346.082-2 .434-2.64 2.777-4.161 5.918-4.161s5.484 1.521 5.918 4.161c.109.654.136 1.32.082 2zM12 7c-1.38 0-2.5-1.12-2.5-2.5S10.62 2 12 2s2.5 1.12 2.5 2.5S13.38 7 12 7zm-5 7.5c0-.828.672-1.5 1.5-1.5h7c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5h-7c-.828 0-1.5-.672-1.5-1.5z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold font-heading text-megapayer-text mb-1">Join Our Telegram Community</h3>
                <p className="text-xs font-body text-megapayer-muted mb-3">
                  Have questions, found a bug, or want to share feedback? Join our Telegram group and we'll be happy to help!
                </p>
                <motion.button
                  onClick={handleTelegramClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full megapayer-btn-primary py-3 rounded-xl font-semibold font-heading flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.108 1.134-.608 2.074-1.5 2.82-.893.747-2.06 1.12-3.5 1.12s-2.607-.373-3.5-1.12c-.892-.746-1.392-1.686-1.5-2.82-.054-.68-.027-1.346.082-2 .434-2.64 2.777-4.161 5.918-4.161s5.484 1.521 5.918 4.161c.109.654.136 1.32.082 2zM12 7c-1.38 0-2.5-1.12-2.5-2.5S10.62 2 12 2s2.5 1.12 2.5 2.5S13.38 7 12 7zm-5 7.5c0-.828.672-1.5 1.5-1.5h7c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5h-7c-.828 0-1.5-.672-1.5-1.5z"/>
                  </svg>
                  Join Telegram Group
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Support Information */}
      <div className="px-5 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="megapayer-panel rounded-2xl border border-megapayer-border overflow-hidden"
        >
          <div className="px-4 py-3.5 flex items-center gap-3 border-b border-megapayer-border">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#34D39920]">
              <CustomIcons.HelpCircle className="w-3.5 h-3.5 text-[#34D399]" />
            </div>
            <h2 className="text-sm font-semibold font-heading text-megapayer-text">How We Can Help</h2>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FF7A4515] flex-shrink-0 mt-0.5">
                <CustomIcons.AlertTriangle className="w-4 h-4 text-[#FF7A45]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold font-heading text-megapayer-text mb-1">Report Bugs</h3>
                <p className="text-xs font-body text-megapayer-muted">
                  Found an issue? Report it in our Telegram group and our team will investigate and fix it promptly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#22E1FF15] flex-shrink-0 mt-0.5">
                <CustomIcons.MessageSquare className="w-4 h-4 text-[#22E1FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold font-heading text-megapayer-text mb-1">Share Feedback</h3>
                <p className="text-xs font-body text-megapayer-muted">
                  We love hearing from you! Share your ideas, suggestions, and feedback to help us improve.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#7C3AED15] flex-shrink-0 mt-0.5">
                <CustomIcons.HelpCircle className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold font-heading text-megapayer-text mb-1">Get Answers</h3>
                <p className="text-xs font-body text-megapayer-muted">
                  Need help using the wallet? Our community and support team are ready to assist you.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Telegram Link Card */}
      <div className="px-5 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="megapayer-panel rounded-2xl border border-megapayer-border overflow-hidden"
        >
          <motion.button
            onClick={handleTelegramClick}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full p-4 hover:bg-megapayer-panel-soft transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#0088cc15] flex-shrink-0">
                <svg className="w-6 h-6 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.108 1.134-.608 2.074-1.5 2.82-.893.747-2.06 1.12-3.5 1.12s-2.607-.373-3.5-1.12c-.892-.746-1.392-1.686-1.5-2.82-.054-.68-.027-1.346.082-2 .434-2.64 2.777-4.161 5.918-4.161s5.484 1.521 5.918 4.161c.109.654.136 1.32.082 2zM12 7c-1.38 0-2.5-1.12-2.5-2.5S10.62 2 12 2s2.5 1.12 2.5 2.5S13.38 7 12 7zm-5 7.5c0-.828.672-1.5 1.5-1.5h7c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5h-7c-.828 0-1.5-.672-1.5-1.5z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-sm font-semibold font-heading text-megapayer-text">Ettios Chat</h3>
                <p className="text-xs font-body text-megapayer-muted truncate mt-0.5">t.me/megapayerchat</p>
              </div>
              <CustomIcons.ExternalLink className="w-4 h-4 text-megapayer-muted flex-shrink-0" />
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

