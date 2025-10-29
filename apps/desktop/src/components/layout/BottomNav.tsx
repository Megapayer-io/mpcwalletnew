'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CustomIcons } from '@/components/icons/CustomIcons';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const mainNavigation = [
    { name: 'Send', href: '/send', icon: CustomIcons.Send, color: 'text-red-500' },
    { name: 'Receive', href: '/receive', icon: CustomIcons.Download, color: 'text-green-500' },
    { name: 'Dashboard', href: '/', icon: CustomIcons.Wallet, color: 'text-megapayer-teal' },
    { name: 'History', href: '/history', icon: CustomIcons.History, color: 'text-megapayer-violet' },
    { name: 'NFTs', href: '/nfts', icon: CustomIcons.Image, color: 'text-megapayer-accent' },
    { name: 'Networks', href: '/networks', icon: CustomIcons.Globe, color: 'text-blue-500' },
  ];

  const secondaryNavigation = [
    { name: 'Account', href: '/account', icon: CustomIcons.User, color: 'text-megapayer-emerald' },
    { name: 'Tokens', href: '/tokens', icon: CustomIcons.Star, color: 'text-yellow-500' },
    { name: 'Hardware', href: '/hardware', icon: CustomIcons.Shield, color: 'text-purple-500' },
    { name: 'Settings', href: '/settings', icon: CustomIcons.Settings, color: 'text-gray-600' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="relative">
        {/* Subtle shadow effect - no colorful glow */}
        <div className="absolute inset-0 bg-black/5 rounded-full blur-xl"></div>
        
        {/* Main container - Clean and minimal */}
        <div className="relative bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-full shadow-lg px-6 py-4">
          {/* Main Navigation - Clean row */}
          <div className="relative flex items-center justify-center gap-1">
            {mainNavigation.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group relative flex flex-col items-center justify-center px-3.5 py-2 rounded-xl
                    transition-all duration-300 ease-out
                    ${active 
                      ? 'scale-105' 
                      : 'hover:scale-110 active:scale-95'
                    }
                  `}
                  title={item.name}
                >
                  {/* Active background - Subtle and professional */}
                  {active && (
                    <div className="absolute inset-0 bg-gray-900 rounded-xl shadow-md"></div>
                  )}
                  
                  {/* Icon container */}
                  <div className={`
                    relative z-10 w-10 h-10 rounded-lg flex items-center justify-center
                    transition-all duration-300 ease-out
                    ${active 
                      ? 'bg-white shadow-sm' 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                    }
                  `}>
                    <Icon className={`w-5 h-5 transition-all duration-300 ${item.color}`} />
                  </div>
                  
                  {/* Label */}
                  <span className={`
                    relative z-10 mt-1.5 text-[11px] font-semibold tracking-wide
                    transition-all duration-300
                    ${active 
                      ? 'text-white' 
                      : 'text-gray-600 group-hover:text-gray-900'
                    }
                  `}>
                    {item.name}
                  </span>
                  
                  {/* Active indicator - Simple and clean */}
                  {active && (
                    <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full shadow-sm"></div>
                  )}
                  
                  {/* Hover effect */}
                  {!active && (
                    <div className="absolute inset-0 bg-gray-100/0 group-hover:bg-gray-100/50 rounded-xl transition-all duration-300"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Clean divider */}
          <div className="relative flex items-center justify-center mt-3 pt-3">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gray-200"></div>
            
            {/* Secondary Navigation - Clean icons */}
            <div className="flex items-center justify-center gap-1">
              {secondaryNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group relative flex items-center justify-center w-9 h-9 rounded-lg
                      transition-all duration-300 ease-out hover:scale-110 active:scale-95
                      ${active 
                        ? 'bg-gray-900 shadow-sm' 
                        : 'hover:bg-gray-100'
                      }
                    `}
                    title={item.name}
                  >
                    <Icon className={`w-4 h-4 transition-all duration-300 ${active ? 'text-white' : item.color}`} />
                    
                    {/* Active indicator - Simple dot */}
                    {active && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
