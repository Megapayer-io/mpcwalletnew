'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { ReceiveForm } from '@/components/ReceiveForm';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { motion } from 'framer-motion';

// Beautiful SVG Graphics for Receive Page
const ReceiveIcon = () => (
  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="receiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <filter id="glowReceive">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Circle */}
    <circle cx="70" cy="70" r="65" fill="rgba(52, 211, 153, 0.08)" />
    
    {/* Incoming Arrow */}
    <motion.path
      d="M70 20 L70 70 M60 60 L70 70 L80 60"
      stroke="url(#receiveGradient)"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#glowReceive)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
    
    {/* Wallet/Box */}
    <motion.rect
      x="45"
      y="75"
      width="50"
      height="40"
      rx="8"
      fill="none"
      stroke="url(#receiveGradient)"
      strokeWidth="4"
      filter="url(#glowReceive)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
    />
    
    {/* Wallet Opening */}
    <motion.path
      d="M45 85 Q70 75 95 85"
      stroke="url(#receiveGradient)"
      strokeWidth="3"
      strokeLinecap="round"
      filter="url(#glowReceive)"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    />
    
    {/* Coins/Tokens falling in */}
    {[...Array(5)].map((_, i) => (
      <motion.circle
        key={i}
        cx={55 + i * 10}
        cy={30 + i * 8}
        r="6"
        fill="url(#receiveGradient)"
        filter="url(#glowReceive)"
        initial={{ 
          y: 30 + i * 8 - 75,
          opacity: 0,
          scale: 0
        }}
        animate={{
          y: 30 + i * 8,
          opacity: [0, 1, 1, 0],
          scale: [0, 1.2, 1, 0.8]
        }}
        transition={{
          delay: 1 + i * 0.15,
          duration: 1.5,
          repeat: Infinity,
          ease: "easeIn"
        }}
      />
    ))}
    
    {/* Success Checkmark */}
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1.3, 1],
        opacity: [0, 1, 1]
      }}
      transition={{ 
        delay: 2,
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 3
      }}
    >
      <circle cx="105" cy="45" r="20" fill="url(#receiveGradient)" filter="url(#glowReceive)" opacity="0.9" />
      <path
        d="M98 45 L103 50 L112 40"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </motion.g>
    
    {/* Floating Particles */}
    {[...Array(8)].map((_, i) => {
      const angle = (i * 45) * Math.PI / 180;
      const radius = 55;
      const x = 70 + Math.cos(angle) * radius;
      const y = 70 + Math.sin(angle) * radius;
      return (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="3"
          fill="#34D399"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0]
          }}
          transition={{
            delay: 1.5 + i * 0.2,
            duration: 2,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

export default function ReceivePage() {
  const router = useRouter();
  const { isUnlocked, address, currentNetwork, isInitialized } = useWalletStore();

  useEffect(() => {
    if (isInitialized && !isUnlocked) {
      router.push('/unlock');
    }
  }, [isInitialized, isUnlocked, router]);

  if (!isInitialized || !isUnlocked) {
    return null;
  }

  return (
    <div className="min-h-screen megapayer-bg flex flex-col relative overflow-hidden pb-24">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-8"
          style={{
            background: `linear-gradient(135deg, rgba(52,211,153,0.2), rgba(34,225,255,0.15))`
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
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#34D39915] flex-shrink-0">
            <ReceiveIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-heading text-megapayer-text">Receive</h1>
            <p className="text-sm font-body text-megapayer-muted mt-0.5">
              Share your address to receive funds
            </p>
          </div>
        </motion.div>
      </div>

      {/* Receive Form */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 relative z-10">
        <ReceiveForm />
      </div>
    </div>
  );
}
