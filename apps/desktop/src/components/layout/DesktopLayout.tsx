'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { MobileWarning } from '@/components/MobileWarning';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export default function DesktopLayout({ children }: DesktopLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    isInitialized, 
    hasWallet, 
    isUnlocked
  } = useWalletStore();

  const [isTauri, setIsTauri] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if running in Tauri
    setIsTauri(typeof window !== 'undefined' && !!window.electronAPI);
    
    // Check if mobile (for warning)
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Handle Tauri menu events
    if (isTauri && window.electronAPI) {
      // Type assertion to ensure all methods are available
      const api = window.electronAPI as {
        getAppVersion: () => Promise<string>;
        showSaveDialog: (options: any) => Promise<any>;
        showOpenDialog: (options: any) => Promise<any>;
        showMessageBox: (options: any) => Promise<any>;
        onMenuNewWallet: (callback: () => void) => void;
        onMenuImportWallet: (callback: () => void) => void;
        onMenuAbout: (callback: () => void) => void;
        onMenuLearnMore: (callback: () => void) => void;
        removeAllListeners: (channel: string) => void;
      };
      
      const handleNewWallet = () => {
        if (hasWallet) {
          router.push('/account');
        } else {
          router.push('/setup');
        }
      };

      const handleImportWallet = () => {
        if (hasWallet) {
          router.push('/account');
        } else {
          router.push('/setup');
        }
      };

      const handleAbout = () => {
        // Show about dialog
        api.showMessageBox({
          type: 'info',
          title: 'About Megapayer Desktop',
          message: 'Megapayer Desktop Wallet',
          detail: 'Version 1.0.0\nSecure Multi-Chain Crypto Wallet'
        });
      };

      const handleLearnMore = () => {
        // Open external link
        window.open('https://megapayerwalletwhitepaper.vercel.app/', '_blank');
      };

      api.onMenuNewWallet(handleNewWallet);
      api.onMenuImportWallet(handleImportWallet);
      api.onMenuAbout(handleAbout);
      api.onMenuLearnMore(handleLearnMore);

      return () => {
        api.removeAllListeners('menu-new-wallet');
        api.removeAllListeners('menu-import-wallet');
        api.removeAllListeners('menu-about');
        api.removeAllListeners('menu-learn-more');
      };
    }
  }, [isTauri, hasWallet, router]);

  // Show mobile warning if on mobile and not in Tauri
  if (isMobile && !isTauri) {
    return <MobileWarning />;
  }

  // Show loading if not initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-megapayer-accent/20 via-megapayer-violet/10 to-megapayer-teal/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            {/* Outer glow ring */}
            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-megapayer-accent/20 via-megapayer-violet/20 to-megapayer-teal/20 animate-pulse"></div>
            
            {/* Animated gradient circle */}
            <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-megapayer-accent via-megapayer-violet to-megapayer-teal p-1 animate-spin" style={{ animationDuration: '2s' }}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-megapayer-accent to-megapayer-violet rounded-2xl"></div>
              </div>
            </div>
            
            {/* Inner pulsing dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-megapayer-accent rounded-full animate-ping"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-megapayer-text mb-2">Megapayer</h2>
          
          {/* Loading text with shimmer */}
          <div className="relative mb-6">
            <p className="text-sm text-megapayer-text/70 relative z-10">Loading your secure wallet...</p>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-megapayer-accent/10 to-transparent animate-pulse"></div>
          </div>
          
          {/* Progress bar */}
          <div className="w-48 h-1 bg-megapayer-panel rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-megapayer-accent via-megapayer-violet to-megapayer-teal rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-megapayer-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-megapayer-violet rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-megapayer-teal rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Show setup if no wallet exists
  if (!hasWallet) {
    return <>{children}</>;
  }

  // Show unlock if wallet is locked
  if (!isUnlocked) {
    return <>{children}</>;
  }

  // Get page title based on pathname
  const getPageTitle = () => {
    const titles: Record<string, { title: string; subtitle?: string }> = {
      '/': { title: 'Dashboard', subtitle: 'Your Web3 portfolio overview' },
      '/send': { title: 'Send Funds', subtitle: 'Transfer tokens to any address' },
      '/receive': { title: 'Receive Funds', subtitle: 'Get your wallet address' },
      '/history': { title: 'Transaction History', subtitle: 'View all your transactions' },
      '/nfts': { title: 'NFT Collection', subtitle: 'Manage your NFT collection' },
      '/networks': { title: 'Network Management', subtitle: 'Manage blockchain networks' },
      '/account': { title: 'Account Management', subtitle: 'Manage your wallet account' },
      '/tokens': { title: 'Token Management', subtitle: 'Import and manage custom tokens' },
      '/hardware': { title: 'Hardware Wallet', subtitle: 'Connect and manage hardware wallets' },
      '/settings': { title: 'Settings', subtitle: 'Manage your wallet settings' },
      '/browser': { title: 'DApp Browser', subtitle: 'Explore and interact with Web3 applications' },
    };
    return titles[pathname] || { title: 'Megapayer', subtitle: undefined };
  };

  const pageInfo = getPageTitle();

  // Desktop layout with bottom navigation and compact content
  return (
    <div className="min-h-screen bg-gradient-to-br from-megapayer-accent/20 via-megapayer-violet/10 to-megapayer-teal/20 pb-28">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
        
        {/* Page Content - Compact */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-4">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
