'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { SendForm } from '@/components/SendForm';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { getTokenIcon } from '@/lib/tokenIconService';
import { motion } from 'framer-motion';

interface Token {
  address: string;
  symbol: string;
  decimals: number;
  name?: string;
}

// Amazing SVG Graphics for Send Page
const SendIcon = () => (
  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sendGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <filter id="glowSend">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Circle */}
    <circle cx="70" cy="70" r="65" fill="rgba(34, 225, 255, 0.08)" />
    
    {/* Send Arrow - Animated Path */}
    <motion.path
      d="M30 70 L90 70 M85 60 L90 70 L85 80"
      stroke="url(#sendGradient)"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#glowSend)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
    
    {/* Sending Circle */}
    <motion.circle
      cx="30"
      cy="70"
      r="15"
      fill="none"
      stroke="url(#sendGradient)"
      strokeWidth="3"
      filter="url(#glowSend)"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
    />
    
    {/* Particles flying out */}
    {[...Array(6)].map((_, i) => {
      const angle = (i * 60) * Math.PI / 180;
      const radius = 35;
      return (
        <motion.circle
          key={i}
          cx="70"
          cy="70"
          r="3"
          fill="#22E1FF"
          initial={{ 
            x: Math.cos(angle) * 0 - 70,
            y: Math.sin(angle) * 0 - 70,
            opacity: 0,
            scale: 0
          }}
          animate={{
            x: Math.cos(angle) * radius - 70,
            y: Math.sin(angle) * radius - 70,
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0]
          }}
          transition={{
            delay: 1 + i * 0.1,
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      );
    })}
    
    {/* Destination Circle */}
    <motion.circle
      cx="100"
      cy="70"
      r="12"
      fill="url(#sendGradient)"
      filter="url(#glowSend)"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        delay: 0.8,
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    
    {/* Success Checkmark */}
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
      transition={{ delay: 2, duration: 0.5 }}
    >
      <circle cx="100" cy="70" r="20" fill="rgba(52,211,153,0.2)" />
      <path
        d="M93 70 L97 74 L107 64"
        stroke="#34D399"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </motion.g>
  </svg>
);

export default function SendPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const [nativeTokenLogo, setNativeTokenLogo] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [initialTo, setInitialTo] = useState<string>('');
  const [initialAmount, setInitialAmount] = useState<string>('');
  const { isUnlocked, currentNetwork, isInitialized } = useWalletStore();

  useEffect(() => {
    if (isInitialized && !isUnlocked) {
      router.push('/unlock');
    }
  }, [isInitialized, isUnlocked, router]);

  // Handle query parameters from scanner
  useEffect(() => {
    const to = searchParams.get('to');
    const amount = searchParams.get('amount');
    if (to) {
      setInitialTo(decodeURIComponent(to));
    }
    if (amount) {
      setInitialAmount(decodeURIComponent(amount));
    }
  }, [searchParams]);

  useEffect(() => {
    loadCustomTokens();
  }, [currentNetwork?.chainId]);

  useEffect(() => {
    const fetchNativeTokenLogo = async () => {
      if (currentNetwork?.symbol) {
        try {
          const iconResult = await getTokenIcon(currentNetwork.symbol, '');
          if (iconResult.url) {
            setNativeTokenLogo(iconResult.url);
          }
        } catch (error) {
          console.log(`Error fetching logo for native token ${currentNetwork.symbol}:`, error);
        }
      }
    };
    fetchNativeTokenLogo();
  }, [currentNetwork?.symbol]);

  const loadCustomTokens = () => {
    if (!currentNetwork?.chainId) {
      setCustomTokens([]);
      return;
    }
    
    try {
      const oldTokenKey = 'mpc-wallet-tokens';
      const networkKey = `mpc-wallet-tokens-${currentNetwork.chainId}`;
      
      const oldTokens = localStorage.getItem(oldTokenKey);
      const existingNewTokens = localStorage.getItem(networkKey);
      
      if (oldTokens && !existingNewTokens) {
        localStorage.setItem(networkKey, oldTokens);
      }
      
      const storedTokens = localStorage.getItem(networkKey);
      let tokens = storedTokens ? JSON.parse(storedTokens) : [];
      setCustomTokens(tokens);
      
      if (!selectedToken) {
        setSelectedToken({
          address: '',
          symbol: currentNetwork?.symbol || 'ETH',
          decimals: 18,
          name: currentNetwork?.name || 'Ethereum'
        });
      }
    } catch (error) {
      console.error('Failed to load custom tokens:', error);
    }
  };

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
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#FF7A4515] flex-shrink-0">
            <SendIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-heading text-megapayer-text">Send</h1>
            <p className="text-sm font-body text-megapayer-muted mt-0.5">
              Transfer tokens securely
            </p>
          </div>
        </motion.div>
      </div>

      {/* Send Form */}
      {selectedToken && (
        <div className="flex-1 overflow-y-auto px-5 pb-4 relative z-10">
          <SendForm 
            selectedToken={selectedToken}
            onTokenChange={setSelectedToken}
            customTokens={customTokens}
            nativeTokenLogo={nativeTokenLogo}
            currentNetwork={currentNetwork}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            loadCustomTokens={loadCustomTokens}
            initialTo={initialTo}
            initialAmount={initialAmount}
          />
        </div>
      )}
    </div>
  );
}
