'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWalletStore } from '@/store/wallet';
import {
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  Wallet,
  Shield,
  Globe,
  LogOut,
  Copy,
  ExternalLink,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const router = useRouter();
  const { address, currentNetwork, isUnlocked, lock } = useWalletStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

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
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/30 px-8 py-6 z-40">
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1 font-medium">{subtitle}</p>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <div className={`
              relative transition-all duration-300
              ${searchFocused ? 'scale-105' : 'scale-100'}
            `}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search transactions, addresses..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="pl-10 pr-4 py-2.5 border border-gray-300/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-white/50 backdrop-blur-sm transition-all duration-300 w-64 hover:bg-white/70"
              />
            </div>
          </div>


          {/* Notifications */}
          <button className="relative p-2.5 text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-110">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* User Menu */}
          {isUnlocked && address ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50/50 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                  <p className="text-xs text-gray-500">Connected</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl z-50 animate-fade-in">
                  <div className="p-4 border-b border-gray-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">MPC Wallet</p>
                        <p className="text-xs text-gray-500">Professional Web3</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Wallet Address
                    </div>
                    <div className="px-3 py-3 bg-gray-50/50 rounded-lg mb-3">
                      <p className="text-sm font-mono text-gray-900 break-all">
                        {address}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <button
                        onClick={handleCopyAddress}
                        className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Address</span>
                      </button>
                      
                      <button className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                        <ExternalLink className="w-4 h-4" />
                        <span>View on Explorer</span>
                      </button>
                      
                      <Link
                        href="/account"
                        className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <User className="w-4 h-4" />
                        <span>Account Management</span>
                      </Link>
                      
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-200/50 my-3"></div>
                    
                    <button
                      onClick={handleLock}
                      className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Lock Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Wallet Locked</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};