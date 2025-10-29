'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const router = useRouter();
  const { address, currentNetwork, isUnlocked, lock } = useWalletStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // You could add a toast notification here
    }
  };

  const handleLock = () => {
    lock();
    setShowUserMenu(false);
    router.push('/unlock');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-filter backdrop-blur-xl bg-megapayer-panel/95 px-6 h-16 border-b border-megapayer-border/50 flex items-center">
      <div className="flex items-center justify-between w-full">
        {/* Left side - Logo */}
        <div className="flex items-center gap-2">
          <img src="/megapayer-logo.svg" alt="Megapayer" className="w-6 h-6" />
          <span className="text-sm font-bold text-megapayer-text font-heading hidden sm:block">Megapayer</span>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* User Menu */}
          {isUnlocked && address ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50/50 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-megapayer-teal via-megapayer-violet to-megapayer-accent rounded-xl flex items-center justify-center shadow-lg">
                    <CustomIcons.User className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <CustomIcons.ChevronDown className={`w-4 h-4 text-megapayer-muted transition-transform duration-200 flex items-center justify-center ${showUserMenu ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 megapayer-panel backdrop-blur-xl border border-megapayer-border rounded-xl shadow-megapayer z-50 animate-fade-in">
                  <div className="p-4 border-b border-megapayer-border">
                    <div className="flex items-center space-x-3">
                      <img src="/megapayer-logo.svg" alt="Megapayer logo" className="w-12 h-12" />
                      <div>
                        <p className="text-sm font-semibold text-megapayer-text">Megapayer</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="px-3 py-2 text-xs font-semibold text-megapayer-muted uppercase tracking-wide">
                      Wallet Address
                    </div>
                    <div className="px-3 py-3 megapayer-panel-soft rounded-lg mb-3">
                      <p className="text-sm font-mono text-megapayer-text break-all">
                        {address}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <button
                        onClick={handleCopyAddress}
                        className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-all duration-300 hover:scale-[1.02] group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-megapayer-teal/20 to-megapayer-teal/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <CustomIcons.Copy className="w-4 h-4 text-megapayer-teal" />
                        </div>
                        <span className="font-medium">Copy Address</span>
                      </button>
                      
                      <button className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-all duration-300 hover:scale-[1.02] group">
                        <div className="w-8 h-8 bg-gradient-to-br from-megapayer-violet/20 to-megapayer-violet/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <CustomIcons.ExternalLink className="w-4 h-4 text-megapayer-violet" />
                        </div>
                        <span className="font-medium">View on Explorer</span>
                      </button>
                      
                      <Link
                        href="/account"
                        className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-all duration-300 hover:scale-[1.02] group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-megapayer-emerald/20 to-megapayer-emerald/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <CustomIcons.User className="w-4 h-4 text-megapayer-emerald" />
                        </div>
                        <span className="font-medium">Account Management</span>
                      </Link>
                      
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-all duration-300 hover:scale-[1.02] group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-megapayer-accent/20 to-megapayer-accent/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <CustomIcons.Settings className="w-4 h-4 text-megapayer-accent" />
                        </div>
                        <span className="font-medium">Settings</span>
                      </Link>
                    </div>
                    
                    <div className="border-t border-megapayer-border my-3"></div>
                    
                    <button
                      onClick={handleLock}
                      className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50/10 rounded-lg transition-all duration-300 hover:scale-[1.02] group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <CustomIcons.LogOut className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="font-medium">Lock Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-megapayer-muted">
              <CustomIcons.Shield className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};