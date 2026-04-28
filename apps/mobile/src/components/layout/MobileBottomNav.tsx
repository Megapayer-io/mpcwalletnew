'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CustomIcons } from '@/components/icons/CustomIcons';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  // Main navigation items with vibrant colorful icons matching dashboard
  const mainNavItems = [
    { 
      name: 'Home', 
      href: '/', 
      icon: CustomIcons.Wallet,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      activeBg: 'bg-blue-500 dark:bg-blue-600',
      activeColor: 'text-white',
      labelColor: 'text-gray-700 dark:text-gray-300',
      activeLabelColor: 'text-blue-600 dark:text-blue-400',
    },
    { 
      name: 'NFTs', 
      href: '/nfts', 
      icon: CustomIcons.Image,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      activeBg: 'bg-purple-500 dark:bg-purple-600',
      activeColor: 'text-white',
      labelColor: 'text-gray-700 dark:text-gray-300',
      activeLabelColor: 'text-purple-600 dark:text-purple-400',
    },
    { 
      name: 'Swap', 
      href: '/swap', 
      icon: CustomIcons.Swap,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      activeBg: 'bg-indigo-500 dark:bg-indigo-600',
      activeColor: 'text-white',
      labelColor: 'text-gray-700 dark:text-gray-300',
      activeLabelColor: 'text-indigo-600 dark:text-indigo-400',
      disabled: true, // Disabled for now
    },
    { 
      name: 'History', 
      href: '/history', 
      icon: CustomIcons.History,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      activeBg: 'bg-orange-500 dark:bg-orange-600',
      activeColor: 'text-white',
      labelColor: 'text-gray-700 dark:text-gray-300',
      activeLabelColor: 'text-orange-600 dark:text-orange-400',
    },
    { 
      name: 'More', 
      href: '/settings', 
      icon: CustomIcons.Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-800/30',
      activeBg: 'bg-gray-600 dark:bg-gray-500',
      activeColor: 'text-white',
      labelColor: 'text-gray-700 dark:text-gray-300',
      activeLabelColor: 'text-gray-600 dark:text-gray-400',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Don't show on setup/unlock pages
  const hideOnPages = ['/setup', '/unlock'];
  if (hideOnPages.some(page => pathname.startsWith(page))) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-xl">
      <div className="px-4 py-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = !item.disabled && isActive(item.href);
            const isDisabled = item.disabled;
            
            const content = (
              <>
                <div
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    transition-all duration-300
                    ${isDisabled 
                      ? `${item.bgColor} opacity-60 cursor-not-allowed`
                      : active
                      ? `${item.activeBg} shadow-lg scale-105`
                      : `${item.bgColor} group-hover:scale-110 group-hover:shadow-md border border-transparent hover:border-gray-200 dark:hover:border-gray-700`
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-6 h-6 transition-all duration-300
                      ${isDisabled
                        ? `${item.color} opacity-60`
                        : active 
                        ? `${item.activeColor} scale-110` 
                        : `${item.color}`
                      }
                    `}
                  />
                </div>
                <span
                  className={`
                    mt-1.5 text-[10px] font-bold
                    transition-all duration-300
                    ${isDisabled
                      ? `${item.labelColor} opacity-60`
                      : active 
                      ? `${item.activeLabelColor}` 
                      : `${item.labelColor}`
                    }
                  `}
                >
                  {item.name}
                </span>
              </>
            );
            
            if (isDisabled) {
              return (
                <button
                  key={item.name}
                  type="button"
                  disabled
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="flex flex-col items-center justify-center min-w-[64px] py-1.5 cursor-not-allowed"
                >
                  {content}
                </button>
              );
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center min-w-[64px] py-1.5 group"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

