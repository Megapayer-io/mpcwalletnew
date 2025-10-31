'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ title, subtitle }) => {
  const pathname = usePathname();
  const { 
    address, 
    isUnlocked,
    currentAccount,
    accounts,
    switchAccount
  } = useWalletStore();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAccountMenu]);

  // Close dropdown if there's only one account
  useEffect(() => {
    if (accounts.length <= 1 && showAccountMenu) {
      setShowAccountMenu(false);
    }
  }, [accounts.length, showAccountMenu]);

  const handleAccountSwitch = (address: string) => {
    switchAccount(address);
    setShowAccountMenu(false);
  };

  const getAccountDisplayName = () => {
    if (currentAccount?.name) {
      return currentAccount.name;
    }
    if (address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return 'Account';
  };

  const isDashboard = pathname === '/';

  // Don't show on setup/unlock pages
  const hideOnPages = ['/setup', '/unlock'];
  if (hideOnPages.some(page => pathname.startsWith(page))) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left side - Scanner icon */}
          <div className="flex-shrink-0">
            {isUnlocked && address ? (
              <button
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-950/20 transition-all duration-300 hover:scale-110 hover:shadow-md"
                title="Scanner (Coming soon)"
              >
                <CustomIcons.QrCode className="w-6 h-6 text-blue-500" />
              </button>
            ) : (
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-800/20">
                <CustomIcons.QrCode className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Center - Account Name (only on dashboard) or Title */}
          <div className="flex-1 min-w-0 flex justify-center">
            {isDashboard && isUnlocked && address ? (
              <div className="relative w-full max-w-xs" ref={accountMenuRef}>
                <button
                  onClick={() => {
                    // Only open dropdown if there's more than one account
                    if (accounts.length > 1) {
                      setShowAccountMenu(!showAccountMenu);
                    }
                  }}
                  className={`w-full flex items-center justify-center gap-1.5 py-1 ${
                    accounts.length > 1 ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  disabled={accounts.length <= 1}
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {getAccountDisplayName()}
                  </span>
                  {accounts.length > 1 && (
                    <CustomIcons.ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Account Switcher Dropdown */}
                <AnimatePresence>
                  {showAccountMenu && accounts.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-64 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden z-50"
                    >
                      <div className="relative">
                        <div className="py-1 max-h-56 overflow-y-auto">
                          {accounts.map((account) => {
                            const isActive = account.address === address;
                            return (
                              <button
                                key={account.address}
                                onClick={() => handleAccountSwitch(account.address)}
                                className={`w-full px-3 py-2.5 text-left transition-colors ${
                                  isActive 
                                    ? 'bg-gray-50 dark:bg-gray-800' 
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${
                                      isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {account.name || 'Unnamed Account'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                                    </p>
                                  </div>
                                  {isActive && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white flex-shrink-0" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {/* Scroll indicator */}
                        {accounts.length > 3 && (
                          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none flex items-end justify-center pb-1">
                            <CustomIcons.ChevronDown className="w-3 h-3 text-gray-400 animate-bounce" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center">
                <h1 className="text-base font-medium text-gray-900 dark:text-white truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right side - Settings icon */}
          <div className="flex-shrink-0">
            {isUnlocked && address ? (
              <Link
                href="/settings"
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-800/20 hover:scale-110 hover:shadow-md transition-all duration-300"
              >
                <CustomIcons.Settings className="w-6 h-6 text-gray-500" />
              </Link>
            ) : (
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-800/20">
                <CustomIcons.Shield className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
