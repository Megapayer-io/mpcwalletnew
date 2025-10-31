'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { motion } from 'framer-motion';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    isInitialized, 
    hasWallet, 
    isUnlocked
  } = useWalletStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      setIsLoading(false);
      
      // Redirect logic
      if (!hasWallet && !pathname.startsWith('/setup') && !pathname.startsWith('/onboarding')) {
        // Check if user has seen onboarding
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
          router.push('/onboarding');
        } else {
          router.push('/setup');
        }
        return;
      }
      
      if (hasWallet && !isUnlocked && pathname !== '/unlock' && !pathname.startsWith('/setup') && !pathname.startsWith('/onboarding')) {
        router.push('/unlock');
        return;
      }
    }
  }, [isInitialized, hasWallet, isUnlocked, pathname, router]);

  // Get page title based on pathname
  const getPageInfo = () => {
    const pageInfo: Record<string, { title: string; subtitle?: string }> = {
      '/': { title: 'Dashboard', subtitle: 'Your Web3 portfolio' },
      '/send': { title: 'Send Funds', subtitle: 'Transfer tokens securely' },
      '/receive': { title: 'Receive Funds', subtitle: 'Get your wallet address' },
      '/history': { title: 'History', subtitle: 'Transaction records' },
      '/nfts': { title: 'NFTs', subtitle: 'Your collection' },
      '/networks': { title: 'Networks', subtitle: 'Blockchain networks' },
      '/account': { title: 'Account', subtitle: 'Manage your wallet' },
      '/tokens': { title: 'Tokens', subtitle: 'Token management' },
      '/hardware': { title: 'Hardware', subtitle: 'Hardware wallet' },
      '/settings': { title: 'Settings', subtitle: 'Wallet settings' },
      '/browser': { title: 'Browser', subtitle: 'Web3 DApps' },
      '/setup': { title: 'Setup', subtitle: 'Create or import wallet' },
      '/unlock': { title: 'Unlock', subtitle: 'Enter your password' },
    };
    return pageInfo[pathname] || { title: 'Megapayer', subtitle: undefined };
  };

  const pageInfo = getPageInfo();

  // Show loading screen
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="w-16 h-16 rounded-lg bg-gray-900 dark:bg-white p-3 animate-pulse">
              <img src="/megapayer-logo.svg" alt="Megapayer" className="w-full h-full dark:invert" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Megapayer</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  // Don't show layout on setup/unlock/onboarding pages
  const hideLayoutOnPages = ['/setup', '/unlock', '/onboarding'];
  const shouldHideLayout = hideLayoutOnPages.some(page => pathname.startsWith(page));

  if (shouldHideLayout) {
    return <>{children}</>;
  }

  // Main mobile layout
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col pb-20 safe-area-inset-bottom">
      {/* Header */}
      <MobileHeader title={pageInfo.title} subtitle={pageInfo.subtitle} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

