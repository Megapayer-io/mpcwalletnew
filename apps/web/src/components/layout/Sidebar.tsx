'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import {
  Home,
  Send,
  Download,
  History,
  Globe,
  Image,
  Settings,
  Shield,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  HelpCircle,
  Zap,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const pathname = usePathname();
  const { address, currentNetwork, isUnlocked, lock } = useWalletStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, color: 'text-blue-600' },
    { name: 'Send', href: '/send', icon: Send, color: 'text-red-600' },
    { name: 'Receive', href: '/receive', icon: Download, color: 'text-green-600' },
    { name: 'History', href: '/history', icon: History, color: 'text-purple-600' },
    { name: 'NFTs', href: '/nfts', icon: Image, color: 'text-pink-600' },
    { name: 'Networks', href: '/networks', icon: Globe, color: 'text-indigo-600' },
  ];

  const accountNavigation = [
    { name: 'Account Management', href: '/account', icon: User, color: 'text-blue-600' },
    { name: 'Import Tokens', href: '/tokens', icon: Zap, color: 'text-orange-600' },
    { name: 'Hardware Wallet', href: '/hardware', icon: Shield, color: 'text-green-600' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleLock = () => {
    lock();
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50 hover:bg-white transition-all duration-300"
        >
          {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {showMobileMenu && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-white/98 via-white/95 to-white/98 backdrop-blur-xl border-r border-gray-200/30 transform transition-all duration-500 ease-out
        lg:translate-x-0 lg:static lg:inset-0 lg:w-72
        ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}
        shadow-2xl lg:shadow-xl
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              {!isCollapsed && (
                <div className="animate-fade-in">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    MPC Wallet
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Professional Web3</p>
                </div>
              )}
            </div>
            <button
              onClick={onToggle}
              className="hidden lg:block p-2 rounded-lg hover:bg-gray-100/50 transition-all duration-200 hover:scale-105"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>


          {/* Navigation */}
          <nav className="p-4 pb-2 space-y-1">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`
                    group flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                    ${isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]'
                      : 'text-gray-700 hover:bg-gray-100/50 hover:text-gray-900'
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                    ${isActive(item.href) 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 group-hover:bg-white group-hover:shadow-md'
                    }
                  `}>
                    <Icon className={`w-4 h-4 ${isActive(item.href) ? 'text-white' : item.color}`} />
                  </div>
                  {!isCollapsed && (
                    <span className="animate-fade-in">{item.name}</span>
                  )}
                  {isActive(item.href) && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Account Management Section */}
          <div className="px-4 pb-4 border-t border-gray-200/50 mt-4">
            <div className="mb-3">
              {!isCollapsed && (
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4">
                  Account & Tools
                </p>
              )}
            </div>
            <div className="space-y-1">
              {accountNavigation.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`
                      group flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                      ${isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]'
                        : 'text-gray-700 hover:bg-gray-100/50 hover:text-gray-900'
                      }
                    `}
                    style={{ animationDelay: `${(index + navigation.length) * 50}ms` }}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                      ${isActive(item.href) 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 group-hover:bg-white group-hover:shadow-md'
                      }
                    `}>
                      <Icon className={`w-4 h-4 ${isActive(item.href) ? 'text-white' : item.color}`} />
                    </div>
                    {!isCollapsed && (
                      <span className="animate-fade-in">{item.name}</span>
                    )}
                    {isActive(item.href) && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200/50 space-y-2">
            <button
              onClick={() => {/* Handle notifications */}}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100/50 hover:text-gray-900 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              {!isCollapsed && <span>Notifications</span>}
            </button>
            
            <button
              onClick={() => {/* Handle help */}}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100/50 hover:text-gray-900 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              {!isCollapsed && <span>Help & Support</span>}
            </button>

            {isUnlocked && (
              <button
                onClick={handleLock}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                {!isCollapsed && <span>Lock Wallet</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};