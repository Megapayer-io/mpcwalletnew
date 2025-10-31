'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomIcons } from './icons/CustomIcons';
import { useWalletStore } from '@/store/wallet';

interface PinProtectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  description: string;
}

// Elegant Lock Icon for Password Entry
const PasswordLockIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#34D399" />
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
    <circle cx="60" cy="60" r="55" fill="rgba(34, 225, 255, 0.08)" />
    
    {/* Lock Body */}
    <motion.rect
      x="35"
      y="50"
      width="50"
      height="45"
      rx="6"
      fill="none"
      stroke="url(#lockGradient)"
      strokeWidth="4"
      filter="url(#glowLock)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
    
    {/* Lock Shackle */}
    <motion.path
      d="M45 50 Q45 30 60 30 Q75 30 75 50"
      fill="none"
      stroke="url(#lockGradient)"
      strokeWidth="4"
      strokeLinecap="round"
      filter="url(#glowLock)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
    />
    
    {/* Keyhole */}
    <motion.circle
      cx="60"
      cy="72"
      r="8"
      fill="none"
      stroke="url(#lockGradient)"
      strokeWidth="3"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
    />
    
    {/* Glowing Particles */}
    {[...Array(6)].map((_, i) => {
      const angle = (i * 60) * Math.PI / 180;
      const radius = 45;
      const x = 60 + Math.cos(angle) * radius;
      const y = 60 + Math.sin(angle) * radius;
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
            delay: 0.8 + i * 0.1,
            duration: 2,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

export const PinProtection: React.FC<PinProtectionProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  description
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const { unlock } = useWalletStore();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setError('');
      setAttempts(0);
      setShowPassword(false);
    }
  }, [isOpen]);

  // Auto-focus password input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const input = document.querySelector('input[type="password"], input[type="text"]') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await unlock(password);
      setAttempts(0);
      onSuccess();
      setPassword('');
      onClose();
    } catch (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setError('Too many failed attempts. Please try again later.');
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        setError(`Invalid password. ${3 - newAttempts} attempts remaining.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setAttempts(0);
    setShowPassword(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="megapayer-panel rounded-2xl border border-megapayer-border w-full max-w-sm p-6 shadow-xl"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-megapayer-panel-soft text-megapayer-muted hover:text-megapayer-text transition-colors"
            >
              <CustomIcons.X className="w-4 h-4" />
            </button>

            {/* Icon and Title */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <PasswordLockIcon />
              </div>
              <h2 className="text-xl font-bold font-heading text-megapayer-text mb-1">{title}</h2>
              <p className="text-sm font-body text-megapayer-muted">{description}</p>
            </div>

            {/* Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3.5 pr-12 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal text-megapayer-text placeholder-megapayer-muted font-body"
                    autoFocus
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-megapayer-muted hover:text-megapayer-text transition-colors"
                    disabled={isLoading}
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
                  className="flex items-center gap-2 p-3 megapayer-panel-soft border border-red-400/30 rounded-xl"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CustomIcons.AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-body text-red-500">{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading || !password.trim()}
                whileHover={{ scale: isLoading || !password.trim() ? 1 : 1.02 }}
                whileTap={{ scale: isLoading || !password.trim() ? 1 : 0.98 }}
                className="w-full megapayer-btn-primary py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold font-heading transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify'
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
