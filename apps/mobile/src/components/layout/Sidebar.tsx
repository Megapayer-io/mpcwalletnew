'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const pathname = usePathname();
  const { address, currentNetwork, isUnlocked, lock } = useWalletStore();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: CustomIcons.Wallet, color: 'text-megapayer-teal' },
    { name: 'Send', href: '/send', icon: CustomIcons.Send, color: 'text-megapayer-accent' },
    { name: 'Receive', href: '/receive', icon: CustomIcons.Download, color: 'text-megapayer-emerald' },
    { name: 'History', href: '/history', icon: CustomIcons.History, color: 'text-megapayer-violet' },
    { name: 'NFTs', href: '/nfts', icon: CustomIcons.Image, color: 'text-megapayer-accent' },
    { name: 'Networks', href: '/networks', icon: CustomIcons.Globe, color: 'text-megapayer-teal' },
  ];

  const accountNavigation = [
    { name: 'Account Management', href: '/account', icon: CustomIcons.User, color: 'text-megapayer-teal' },
    { name: 'Import Tokens', href: '/tokens', icon: CustomIcons.Zap, color: 'text-megapayer-accent' },
    { name: 'Hardware Wallet', href: '/hardware', icon: CustomIcons.Shield, color: 'text-megapayer-emerald' },
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
      {/* Sidebar - Hidden on mobile since we use MobileBottomNav */}
      <div className={`
        hidden lg:block
        fixed inset-y-0 left-0 z-50 bg-megapayer-panel backdrop-blur-xl border-r border-megapayer-border transform transition-all duration-500 ease-out
        ${isCollapsed ? 'w-16 lg:w-16' : 'w-72 lg:w-72'}
        shadow-megapayer lg:shadow-megapayer
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center ${isCollapsed ? 'justify-between px-2' : 'justify-between p-6'} border-b border-megapayer-border`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src="/megapayer-logo.svg" alt="Megapayer logo" className="w-10 h-10" />
              </div>
              {!isCollapsed && (
                <div className="animate-fade-in">
                  <h1 className="text-xl font-bold text-megapayer-text font-heading">
                    Megapayer
                  </h1>
                </div>
              )}
            </div>
            <button
              onClick={onToggle}
              className="hidden lg:block p-2 rounded-lg hover:bg-megapayer-panel-soft transition-all duration-200 hover:scale-105 text-megapayer-muted hover:text-megapayer-text"
            >
              {isCollapsed ? <CustomIcons.ChevronRight className="w-4 h-4" /> : <CustomIcons.ChevronLeft className="w-4 h-4" />}
            </button>
          </div>


          {/* Navigation */}
          <nav className={`${isCollapsed ? 'p-2' : 'p-4'} pb-2 space-y-1`}>
            {navigation.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                    ${isActive(item.href)
                      ? 'bg-gradient-to-r from-megapayer-teal to-megapayer-violet text-white shadow-lg transform scale-[1.02]'
                      : 'text-megapayer-text hover:bg-megapayer-panel-soft hover:text-megapayer-text'
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                    ${isActive(item.href) 
                      ? 'bg-white/20' 
                      : 'bg-megapayer-panel-soft group-hover:bg-megapayer-panel group-hover:shadow-md'
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
          <div className={`${isCollapsed ? 'px-2' : 'px-4'} pb-4 border-t border-gray-200/50 mt-4`}>
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
                      group flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
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
          <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200/50 space-y-2`}>
            <button
              onClick={() => {/* Handle help */}}
              className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100/50 hover:text-gray-900 transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <CustomIcons.HelpCircle className="w-4 h-4" />
              </div>
              {!isCollapsed && <span>Help & Support</span>}
            </button>

            {isUnlocked && (
              <button
                onClick={handleLock}
                className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <CustomIcons.LogOut className="w-4 h-4" />
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