'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { SendForm } from '@/components/SendForm';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { getTokenIcon, generateFallbackIcon } from '@/lib/tokenIconService';

interface Token {
  address: string;
  symbol: string;
  decimals: number;
  name?: string;
}

export default function SendPage() {
  const router = useRouter();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [nativeTokenLogo, setNativeTokenLogo] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isUnlocked, currentNetwork, getBalance } = useWalletStore();

  // Redirect to unlock page if wallet is locked
  useEffect(() => {
    if (!isUnlocked) {
      router.push('/unlock');
    }
  }, [isUnlocked, router]);

  useEffect(() => {
    loadCustomTokens();
  }, [currentNetwork?.chainId]);

  // Fetch native token logo
  useEffect(() => {
    const fetchNativeTokenLogo = async () => {
      if (currentNetwork?.symbol) {
        try {
          const iconResult = await getTokenIcon(currentNetwork.symbol, '');
          if (iconResult.url) {
            setNativeTokenLogo(iconResult.url);
          } else {
            console.log(`❌ No logo found for native token ${currentNetwork.symbol}`);
          }
        } catch (error) {
          console.log(`❌ Error fetching logo for native token ${currentNetwork.symbol}:`, error);
        }
      }
    };
    fetchNativeTokenLogo();
  }, [currentNetwork?.symbol]);

  const loadCustomTokens = () => {
    if (!currentNetwork?.chainId) {
      setCustomTokens([]);
      return;
    }
    
    try {
      // Migrate old tokens to network-specific storage
      const oldTokenKey = 'mpc-wallet-tokens';
      const networkKey = `mpc-wallet-tokens-${currentNetwork.chainId}`;
      
      const oldTokens = localStorage.getItem(oldTokenKey);
      const existingNewTokens = localStorage.getItem(networkKey);
      
      if (oldTokens && !existingNewTokens) {
        console.log(`🔄 Migrating tokens to network-specific storage for network ${currentNetwork.chainId}`);
        localStorage.setItem(networkKey, oldTokens);
        console.log(`✅ Migrated tokens to ${networkKey}`);
      }
      
      // Load tokens specific to current network
      const storedTokens = localStorage.getItem(networkKey);
      let tokens = storedTokens ? JSON.parse(storedTokens) : [];
      setCustomTokens(tokens);
      
      // Set default to native token if no token selected
      if (!selectedToken) {
        setSelectedToken({
          address: '',
          symbol: currentNetwork?.symbol || 'ETH',
          decimals: 18,
          name: currentNetwork?.name || 'Ethereum'
        });
      }
    } catch (error) {
      console.error('Failed to load custom tokens:', error);
    }
  };

  // Show loading while redirecting
  if (!isUnlocked) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-megapayer-teal via-megapayer-violet to-megapayer-accent rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CustomIcons.Send className="w-10 h-10 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-megapayer-text mb-2">Redirecting to unlock page...</h1>
          <p className="text-megapayer-muted">
            Please wait while we redirect you to unlock your wallet.
          </p>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="megapayer-panel p-8 text-megapayer-text relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-megapayer-accent/10 via-megapayer-violet/10 to-megapayer-teal/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-megapayer-accent to-megapayer-violet rounded-2xl flex items-center justify-center shadow-lg">
                <CustomIcons.Send className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 font-heading text-megapayer-text">Send Funds</h1>
                <p className="text-megapayer-muted text-lg">Transfer tokens to any address securely</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-megapayer-accent/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-megapayer-violet/5 rounded-full"></div>
        </div>

        {/* Send Form */}
        {selectedToken && (
          <SendForm 
            selectedToken={selectedToken}
            onTokenChange={setSelectedToken}
            customTokens={customTokens}
            nativeTokenLogo={nativeTokenLogo}
            currentNetwork={currentNetwork}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            loadCustomTokens={loadCustomTokens}
          />
        )}

      </div>
  );
}