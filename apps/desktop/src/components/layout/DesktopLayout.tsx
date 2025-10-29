'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { Sidebar } from '@/components/layout/Sidebar';
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
    isUnlocked, 
    sidebarCollapsed, 
    toggleSidebar 
  } = useWalletStore();

  const [isElectron, setIsElectron] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI);
    
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
    // Handle Electron menu events
    if (isElectron && window.electronAPI) {
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

      window.electronAPI.onMenuNewWallet(handleNewWallet);
      window.electronAPI.onMenuImportWallet(handleImportWallet);

      return () => {
        window.electronAPI.removeAllListeners('menu-new-wallet');
        window.electronAPI.removeAllListeners('menu-import-wallet');
      };
    }
  }, [isElectron, hasWallet, router]);

  // Show mobile warning if on mobile and not in Electron
  if (isMobile && !isElectron) {
    return <MobileWarning />;
  }

  // Show loading if not initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-megapayer-accent/20 via-megapayer-violet/10 to-megapayer-teal/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-megapayer-accent to-megapayer-violet rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <div className="w-10 h-10 bg-white rounded-2xl"></div>
          </div>
          <h2 className="text-2xl font-bold text-megapayer-text mb-2">Megapayer Desktop</h2>
          <p className="text-megapayer-text/70">Loading your secure wallet...</p>
          <div className="mt-6 w-48 h-1 bg-megapayer-panel rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-megapayer-accent to-megapayer-violet rounded-full animate-pulse"></div>
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
    return titles[pathname] || { title: 'Megapayer Desktop', subtitle: undefined };
  };

  const pageInfo = getPageTitle();

  // Desktop layout with sidebar and header
  return (
    <div className="min-h-screen bg-gradient-to-br from-megapayer-accent/20 via-megapayer-violet/10 to-megapayer-teal/20">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
