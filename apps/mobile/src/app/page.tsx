'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { Loader } from '@/components/Loader';
import { motion } from 'framer-motion';
import { getTokenIcon } from '@/lib/tokenIconService';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance?: string;
  usdValue?: string;
  logoUrl?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [usdBalance, setUsdBalance] = useState<string>('0.00');
  const [isLoadingUsd, setIsLoadingUsd] = useState(false);
  const [nativeTokenLogo, setNativeTokenLogo] = useState<string | null>(null);
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [tokenUsdValues, setTokenUsdValues] = useState<Record<string, string>>({});
  const [isLoadingTokenBalances, setIsLoadingTokenBalances] = useState(false);
  
  const {
    isInitialized,
    hasWallet,
    isUnlocked,
    address,
    currentNetwork,
    balance,
    getBalance,
    getUsdBalance,
    getTokenBalance,
    isLoading,
  } = useWalletStore();

  useEffect(() => {
    if (isInitialized && !hasWallet) {
      router.push('/setup');
      return;
    }
    
    if (isInitialized && hasWallet && !isUnlocked) {
      router.push('/unlock');
      return;
    }
  }, [isInitialized, hasWallet, isUnlocked, router]);

  useEffect(() => {
    if (isUnlocked && address) {
      getBalance();
      loadCustomTokens();
    }
  }, [isUnlocked, address, getBalance, currentNetwork?.chainId]);

  // Reload tokens when returning to dashboard (e.g., after adding token)
  useEffect(() => {
    const handleFocus = () => {
      if (isUnlocked && address && currentNetwork?.chainId) {
        loadCustomTokens();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isUnlocked, address, currentNetwork?.chainId]);

  // Load custom tokens from localStorage
  const loadCustomTokens = () => {
    if (!currentNetwork?.chainId) {
      setCustomTokens([]);
      return;
    }
    
    try {
      const networkKey = `mpc-wallet-tokens-${currentNetwork.chainId}`;
      const storedTokens = localStorage.getItem(networkKey);
      if (storedTokens) {
        const tokens: Token[] = JSON.parse(storedTokens);
        // Filter out native token (address === '') as we show it separately
        const custom = tokens.filter(token => token.address !== '');
        setCustomTokens(custom);
        // Load balances for custom tokens
        if (custom.length > 0) {
          loadTokenBalances(custom);
        }
      } else {
        setCustomTokens([]);
      }
    } catch (error) {
      console.error('Failed to load custom tokens:', error);
      setCustomTokens([]);
    }
  };

  // Load balances for custom tokens
  const loadTokenBalances = async (tokens: Token[]) => {
    if (!address || !currentNetwork) return;
    
    setIsLoadingTokenBalances(true);
    const balances: Record<string, string> = {};
    const usdValues: Record<string, string> = {};
    
    try {
      for (const token of tokens) {
        try {
          const tokenBalance = await getTokenBalance({ 
            tokenAddress: token.address, 
            decimals: token.decimals 
          });
          balances[token.address] = tokenBalance;
          
          // Get USD value
          if (parseFloat(tokenBalance) > 0) {
            try {
              const usdValue = await getUsdBalance(tokenBalance, token.symbol);
              usdValues[token.address] = usdValue !== 'Price unavailable' ? usdValue : '0.00';
            } catch (error) {
              usdValues[token.address] = '0.00';
            }
          } else {
            usdValues[token.address] = '0.00';
          }
        } catch (error) {
          console.error(`Failed to load balance for token ${token.symbol}:`, error);
          balances[token.address] = '0';
          usdValues[token.address] = '0.00';
        }
      }
      
      setTokenBalances(balances);
      setTokenUsdValues(usdValues);
    } catch (error) {
      console.error('Failed to load token balances:', error);
    } finally {
      setIsLoadingTokenBalances(false);
    }
  };

  // Fetch native token logo
  useEffect(() => {
    const fetchNativeTokenLogo = async () => {
      if (currentNetwork?.symbol) {
        try {
          const iconResult = await getTokenIcon(currentNetwork.symbol, '');
          if (iconResult.url) {
            setNativeTokenLogo(iconResult.url);
          } else {
            setNativeTokenLogo(null);
          }
        } catch (error) {
          console.error('Error fetching native token logo:', error);
          setNativeTokenLogo(null);
        }
      }
    };

    fetchNativeTokenLogo();
  }, [currentNetwork?.symbol]);

  // Fetch USD balance
  useEffect(() => {
    const loadUsdBalance = async () => {
      if (balance && currentNetwork?.symbol) {
        setIsLoadingUsd(true);
        try {
          const usd = await getUsdBalance(balance, currentNetwork.symbol);
          setUsdBalance(usd);
        } catch (error) {
          console.error('Failed to load USD balance:', error);
          setUsdBalance('0.00');
        } finally {
          setIsLoadingUsd(false);
        }
      }
    };

    loadUsdBalance();
  }, [balance, currentNetwork?.symbol, getUsdBalance]);

  if (!isInitialized) {
    return (
      <Loader 
        text="Initializing wallet..." 
        size="lg" 
        fullScreen 
      />
    );
  }

  const formattedBalance = balance ? parseFloat(balance).toFixed(4) : '0.0000';
  const displayBalance = showBalance ? formattedBalance : '••••••';
  const displayUsd = showBalance 
    ? (usdBalance !== 'Price unavailable' ? `$${usdBalance}` : '—')
    : '••••••';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-24">
      {/* Premium Balance Card - Beautiful Gradient with Icon Colors */}
      <div className="px-5 pt-6 pb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-gradient-to-br from-red-50 via-emerald-50 via-blue-50 to-purple-50 dark:from-red-950/20 dark:via-emerald-950/20 dark:via-blue-950/20 dark:to-purple-950/20 rounded-3xl p-6 shadow-xl border border-red-200/30 dark:border-purple-800/30 relative overflow-hidden"
        >
          {/* Beautiful Pattern Overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 70% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
            }} />
          </div>
          
          {/* Subtle shimmer effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" style={{
              animation: 'shimmer 3s infinite'
            }} />
          </div>
          
          {/* Network Indicator */}
          {currentNetwork && (
            <div className="relative mb-6 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-300/50 dark:border-gray-700/50 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {currentNetwork.name}
                </span>
              </div>
            </div>
          )}

          {/* Balance Display */}
          <div className="relative z-10">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-3 tracking-wider uppercase">Total Balance</p>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {displayUsd}
                  </h1>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm"
                    aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                  >
                    {showBalance ? (
                      <CustomIcons.Eye className="w-4 h-4" />
                    ) : (
                      <CustomIcons.EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {displayBalance} {currentNetwork?.symbol || 'ETH'}
                </p>
              </div>
              <button
                onClick={() => getBalance()}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 border border-gray-300/50 dark:border-gray-700/50 transition-all disabled:opacity-50 shadow-sm"
                aria-label="Refresh balance"
              >
                <CustomIcons.Refresh className={`w-4 h-4 text-gray-700 dark:text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Premium Action Buttons - Single Row with Beautiful Small Icons */}
      <div className="px-5 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2"
        >
          {/* Send Button */}
          <Link
            href="/send"
            className="flex-1 group flex flex-col items-center bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-950/20 flex items-center justify-center mb-1.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
              <CustomIcons.SendArrow className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Send</h3>
          </Link>

          {/* Receive Button */}
          <Link
            href="/receive"
            className="flex-1 group flex flex-col items-center bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-950/20 flex items-center justify-center mb-1.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
              <CustomIcons.ReceiveQR className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Receive</h3>
          </Link>

          {/* Buy Button - Disabled */}
          <div className="flex-1 group flex flex-col items-center bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-950/20 flex items-center justify-center mb-1.5 shadow-sm">
              <CustomIcons.BuyBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-[10px] font-semibold text-gray-500 dark:text-gray-500">Buy</h3>
            <div className="absolute -top-0.5 -right-0.5">
              <span className="px-1 py-0.5 text-[8px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-full border border-blue-200 dark:border-blue-800">SOON</span>
            </div>
          </div>

          {/* Swap Button - Disabled */}
          <div className="flex-1 group flex flex-col items-center bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-950/20 flex items-center justify-center mb-1.5 shadow-sm">
              <CustomIcons.SwapArrows className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-[10px] font-semibold text-gray-500 dark:text-gray-500">Swap</h3>
            <div className="absolute -top-0.5 -right-0.5">
              <span className="px-1 py-0.5 text-[8px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 rounded-full border border-purple-200 dark:border-purple-800">SOON</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Token List with Add Button */}
      <div className="px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2"
        >
          {/* Header with Add Token Button */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tokens</h3>
            <Link
              href="/tokens"
              className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-all"
              title="Add Custom Token"
            >
              <CustomIcons.Plus className="w-4 h-4 text-blue-500" />
            </Link>
          </div>

          {/* Native Token */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                {nativeTokenLogo ? (
                  <img
                    src={nativeTokenLogo}
                    alt={`${currentNetwork?.symbol} logo`}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center rounded-xl shadow-sm"><span class="text-white font-bold text-sm">${currentNetwork?.symbol?.charAt(0) || 'E'}</span></div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center rounded-xl shadow-sm">
                    <span className="text-white font-bold text-sm">
                      {currentNetwork?.symbol?.charAt(0) || 'E'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white text-sm">
                  {currentNetwork?.symbol || 'ETH'}
                </p>
                {currentNetwork?.name && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentNetwork.name}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right ml-3 flex-shrink-0">
              <p className="font-bold text-gray-900 dark:text-white text-sm">
                {displayBalance}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {displayUsd !== '••••••' && displayUsd !== '—' ? displayUsd : '$0.00'}
              </p>
            </div>
          </div>

          {/* Custom Tokens */}
          {customTokens.map((token) => {
            const tokenBalance = tokenBalances[token.address] || '0';
            const tokenUsd = tokenUsdValues[token.address] || '0.00';
            const displayTokenBalance = showBalance 
              ? (parseFloat(tokenBalance) > 0 ? parseFloat(tokenBalance).toFixed(4) : '0')
              : '••••••';
            // Always show $0.00 instead of dash when balance is zero or usd is 0.00
            const displayTokenUsd = showBalance
              ? (tokenUsd && tokenUsd !== 'Price unavailable' && parseFloat(tokenUsd) > 0 
                  ? `$${parseFloat(tokenUsd).toFixed(2)}` 
                  : '$0.00')
              : '••••••';
            
            return (
              <div key={token.address} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    {token.logoUrl ? (
                      <img
                        src={token.logoUrl}
                        alt={`${token.symbol} logo`}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center rounded-xl shadow-sm"><span class="text-white font-bold text-sm">${token.symbol.charAt(0) || 'T'}</span></div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center rounded-xl shadow-sm">
                        <span className="text-white font-bold text-sm">
                          {token.symbol.charAt(0) || 'T'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                      {token.symbol}
                    </p>
                    {token.name && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {token.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {displayTokenBalance}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {displayTokenUsd}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Loading State */}
          {isLoadingTokenBalances && customTokens.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader text="Loading token balances..." size="sm" />
            </div>
          )}

          {/* Empty State - Only show if no custom tokens */}
          {customTokens.length === 0 && !isLoadingTokenBalances && (
            <Link
              href="/tokens"
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                <CustomIcons.Plus className="w-4 h-4 text-blue-500" />
              </div>
              <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                Add Custom Token
              </p>
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}
