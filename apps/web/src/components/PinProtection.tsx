'use client';

import { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use the wallet's unlock function to verify the password
      await unlock(password);
      
      // If unlock succeeds, call onSuccess
      setAttempts(0); // Reset attempts on successful verification
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
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-megapayer-accent/20 via-megapayer-violet/10 to-megapayer-teal/20 backdrop-blur-md flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="megapayer-panel rounded-3xl shadow-2xl w-full max-w-md p-8 relative border border-megapayer-border/50 backdrop-blur-xl bg-white/95 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative Background Elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-megapayer-accent/10 to-megapayer-violet/5 rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br from-megapayer-teal/10 to-megapayer-emerald/5 rounded-full"></div>
            
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-megapayer-panel-soft text-megapayer-muted hover:text-megapayer-text transition-all duration-200 z-10"
            >
              <CustomIcons.X className="h-5 w-5" />
            </button>

            <div className="text-center mb-8 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-megapayer-teal via-megapayer-violet to-megapayer-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CustomIcons.Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-megapayer-text mb-3 font-heading">{title}</h2>
              <p className="text-megapayer-muted">{description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-megapayer-text mb-3">
                  Enter your wallet password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your wallet password"
                    className="w-full px-4 py-4 pr-12 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-megapayer-text placeholder-megapayer-muted"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-megapayer-muted hover:text-megapayer-text transition-colors duration-200"
                  >
                    {showPassword ? <CustomIcons.EyeOff className="h-5 w-5" /> : <CustomIcons.Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  className="flex items-center gap-3 p-4 megapayer-panel-soft border border-red-400/30 rounded-xl"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CustomIcons.AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </motion.div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 megapayer-panel-soft text-megapayer-muted rounded-xl hover:bg-megapayer-panel transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !password.trim()}
                  className="flex-1 megapayer-btn-primary py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify Password'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 p-4 megapayer-panel-soft border border-megapayer-teal/20 rounded-xl relative z-10">
              <div className="flex items-start gap-3">
                <CustomIcons.Shield className="h-5 w-5 text-megapayer-teal mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-megapayer-text text-sm">Security Notice</h3>
                  <p className="text-megapayer-muted text-xs mt-1">
                    Your wallet password is required to access sensitive information. This is the same password you use to unlock your wallet.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

