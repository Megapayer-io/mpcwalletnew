'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { generateFallbackIcon, getTokenIcon } from '@/lib/tokenIconService';
import { cleanupDuplicateTokens } from '@/lib/cleanupDuplicates';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [customTokens, setCustomTokens] = useState<any[]>([]);
  const [portfolioValue, setPortfolioValue] = useState<string>('0.00');
  const [portfolioChange, setPortfolioChange] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nativeTokenLogo, setNativeTokenLogo] = useState<string | null>(null);
  const [usdBalance, setUsdBalance] = useState<string>('0.00');
  
  const {
    isInitialized,
    hasWallet,
    isUnlocked,
    address,
    currentNetwork,
    balance,
    getBalance,
    getUsdBalance,
    isLoading,
    error
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
      cleanupDuplicateTokens(); // Clean up duplicates first
      loadCustomTokens();
      
      // Automatically fetch logos for tokens
      const fetchLogos = async () => {
        const tokens = customTokens.filter(token => !token.logoUrl);
        if (tokens.length > 0) {
          console.log(`🔄 Auto-fetching logos for ${tokens.length} tokens in dashboard...`);
          
          for (const token of tokens) {
            try {
              const iconResult = await getTokenIcon(token.symbol, token.address);
              if (iconResult.url) {
                console.log(`✅ Found logo for ${token.symbol} in dashboard`);
                // Update the token in the list
                setCustomTokens(prevTokens => 
                  prevTokens.map(t => 
                    t.symbol === token.symbol && t.address === token.address 
                      ? { ...t, logoUrl: iconResult.url }
                      : t
                  )
                );
              }
            } catch (error) {
              console.log(`❌ No logo found for ${token.symbol} in dashboard`);
            }
          }
        }
      };
      
      // Run logo fetching after a short delay
      const timeoutId = setTimeout(fetchLogos, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isUnlocked, address, getBalance, customTokens.length, currentNetwork?.chainId]);


  // Fetch native token logo
  useEffect(() => {
    const fetchNativeTokenLogo = async () => {
      if (currentNetwork?.symbol) {
        try {
          console.log(`🔄 Fetching logo for native token: ${currentNetwork.symbol}`);
          const iconResult = await getTokenIcon(currentNetwork.symbol, '');
          if (iconResult.url) {
            console.log(`✅ Found logo for native token ${currentNetwork.symbol}: ${iconResult.url}`);
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
    
    // Clear tokens when switching networks
    setCustomTokens(tokens);
  };

  const addNativeToken = async () => {
    if (!currentNetwork?.symbol) return;
    
    const nativeToken: any = {
      address: '',
      symbol: currentNetwork.symbol,
      name: currentNetwork.name,
      decimals: 18,
      logoUrl: undefined
    };
    
    // Get logo for native token
    try {
      const iconResult = await getTokenIcon(nativeToken.symbol, nativeToken.address);
      if (iconResult.url) {
        nativeToken.logoUrl = iconResult.url;
      }
    } catch (error) {
      console.log('No logo found for native token');
    }
    
    // Add to tokens
    const updatedTokens = [nativeToken, ...customTokens];
    setCustomTokens(updatedTokens);
    
    // Save to network-specific storage
    if (currentNetwork?.chainId) {
      const networkKey = `mpc-wallet-tokens-${currentNetwork.chainId}`;
      localStorage.setItem(networkKey, JSON.stringify(updatedTokens));
    }
  };

  useEffect(() => {
    const loadUsdBalance = async () => {
      if (balance && currentNetwork?.symbol) {
        try {
          const usd = await getUsdBalance(balance, currentNetwork.symbol);
          setUsdBalance(usd);
        } catch (error) {
          console.error('Failed to load USD balance:', error);
          setUsdBalance('0.00');
        }
      }
    };

    loadUsdBalance();
  }, [balance, currentNetwork?.symbol, getUsdBalance]);

  // Update portfolio value when USD balance changes
  useEffect(() => {
    if (usdBalance && usdBalance !== 'Price unavailable') {
      const currentUsdValue = parseFloat(usdBalance) || 0;
      setPortfolioValue(currentUsdValue.toFixed(2));
    }
  }, [usdBalance]);


  const handleRefreshBalance = async () => {
    if (isUnlocked && address) {
      setIsRefreshing(true);
      try {
        await getBalance();
        // Calculate real portfolio value from USD balance
        const currentUsdValue = parseFloat(usdBalance) || 0;
        setPortfolioValue(currentUsdValue.toFixed(2));
        setPortfolioChange(0); // Reset to 0 for now, can be enhanced later
      } catch (error) {
        console.error('Failed to refresh balance:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-megapayer-accent/10 via-megapayer-violet/10 to-megapayer-teal/10">
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            {/* Outer glow ring */}
            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-megapayer-teal/20 via-megapayer-violet/20 to-megapayer-accent/20 animate-pulse"></div>
            
            {/* Animated gradient circle */}
            <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-megapayer-teal via-megapayer-violet to-megapayer-accent p-1 animate-spin" style={{ animationDuration: '2s' }}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <CustomIcons.Wallet className="w-10 h-10 text-megapayer-teal" />
              </div>
            </div>
            
            {/* Inner pulsing dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-megapayer-teal rounded-full animate-ping"></div>
          </div>
          
          {/* Loading text with shimmer */}
          <div className="relative mb-4">
            <p className="text-sm font-semibold text-megapayer-text relative z-10">Initializing wallet...</p>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-megapayer-teal/10 to-transparent animate-pulse"></div>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-megapayer-teal rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-megapayer-violet rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-megapayer-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }


  const quickActions = [
    {
      title: 'Send Funds',
      description: 'Transfer tokens to any address',
      href: '/send',
      icon: CustomIcons.Send,
      color: 'from-megapayer-accent to-megapayer-violet',
      bgColor: 'bg-gradient-to-br from-megapayer-accent/10 to-megapayer-violet/10',
      hoverColor: 'hover:from-megapayer-accent/20 hover:to-megapayer-violet/20',
      textColor: 'text-megapayer-text',
      iconColor: 'text-megapayer-accent'
    },
    {
      title: 'Receive Funds',
      description: 'Get your wallet address',
      href: '/receive',
      icon: CustomIcons.Download,
      color: 'from-megapayer-emerald to-megapayer-teal',
      bgColor: 'bg-gradient-to-br from-megapayer-emerald/10 to-megapayer-teal/10',
      hoverColor: 'hover:from-megapayer-emerald/20 hover:to-megapayer-teal/20',
      textColor: 'text-megapayer-text',
      iconColor: 'text-megapayer-emerald'
    },
    {
      title: 'Networks',
      description: 'Manage blockchain networks',
      href: '/networks',
      icon: CustomIcons.Globe,
      color: 'from-megapayer-violet to-megapayer-teal',
      bgColor: 'bg-gradient-to-br from-megapayer-violet/10 to-megapayer-teal/10',
      hoverColor: 'hover:from-megapayer-violet/20 hover:to-megapayer-teal/20',
      textColor: 'text-megapayer-text',
      iconColor: 'text-megapayer-violet'
    },
    {
      title: 'View NFTs',
      description: 'Manage your NFT collection',
      href: '/nfts',
      icon: CustomIcons.Image,
      color: 'from-megapayer-accent to-megapayer-emerald',
      bgColor: 'bg-gradient-to-br from-megapayer-accent/10 to-megapayer-emerald/10',
      hoverColor: 'hover:from-megapayer-accent/20 hover:to-megapayer-emerald/20',
      textColor: 'text-megapayer-text',
      iconColor: 'text-megapayer-accent'
    }
  ];

  const stats = [
    {
      title: 'Total Balance',
      value: showBalance ? (balance ? parseFloat(balance).toFixed(4) : '0.0000') : '••••••',
      subtitle: currentNetwork?.symbol || 'ETH',
      usdValue: showBalance ? (usdBalance !== 'Price unavailable' ? `≈ $${usdBalance}` : 'Price unavailable') : '••••••',
      icon: CustomIcons.Wallet,
      color: 'text-megapayer-teal',
      bgColor: 'bg-gradient-to-br from-megapayer-teal/10 to-megapayer-teal/20',
      gradient: 'from-megapayer-teal to-megapayer-teal'
    },
    {
      title: 'Network',
      value: currentNetwork?.name || 'Not Connected',
      subtitle: 'Active Network',
      icon: CustomIcons.Globe,
      color: 'text-megapayer-emerald',
      bgColor: 'bg-gradient-to-br from-megapayer-emerald/10 to-megapayer-emerald/20',
      gradient: 'from-megapayer-emerald to-megapayer-emerald'
    },
    {
      title: 'Security',
      value: isUnlocked ? 'Unlocked' : 'Locked',
      subtitle: 'Wallet Status',
      icon: CustomIcons.Shield,
      color: isUnlocked ? 'text-megapayer-emerald' : 'text-megapayer-accent',
      bgColor: isUnlocked ? 'bg-gradient-to-br from-megapayer-emerald/10 to-megapayer-emerald/20' : 'bg-gradient-to-br from-megapayer-accent/10 to-megapayer-accent/20',
      gradient: isUnlocked ? 'from-megapayer-emerald to-megapayer-emerald' : 'from-megapayer-accent to-megapayer-accent'
    }
  ];

        return (
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-3">
              {/* Left Column */}
              <div className="space-y-4">
              {/* Welcome Header */}
              <div className="megapayer-panel p-6 text-megapayer-text relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-megapayer-teal/10 via-megapayer-violet/10 to-megapayer-accent/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src="/ettios-logo.png" alt="Ettios logo" className="w-10 h-10" />
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-megapayer-emerald rounded-full border border-megapayer-panel animate-pulse"></div>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold mb-1 font-heading text-megapayer-text">Welcome back!</h1>
                        <p className="text-megapayer-muted text-base">Your Web3 portfolio overview</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-megapayer-muted text-sm mb-1">Portfolio Value</p>
                      <p 
                        className="text-3xl font-bold cursor-pointer hover:scale-105 transition-transform duration-200 text-megapayer-text"
                        onClick={handleRefreshBalance}
                        title="Click to refresh portfolio value"
                      >
                        {showBalance ? `$${portfolioValue}` : '••••••'}
                      </p>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        {portfolioChange > 0 ? (
                          <CustomIcons.TrendingUp className="w-4 h-4 text-megapayer-emerald" />
                        ) : (
                          <CustomIcons.TrendingDown className="w-4 h-4 text-megapayer-accent" />
                        )}
                        <span className={`text-sm font-medium ${portfolioChange > 0 ? 'text-megapayer-emerald' : 'text-megapayer-accent'}`}>
                          {showBalance ? `${portfolioChange > 0 ? '+' : ''}${portfolioChange}%` : '••••'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Stats Grid - Compact */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    title: 'Total Balance',
                    value: showBalance ? (balance ? parseFloat(balance).toFixed(4) : '0.0000') : '••••••',
                    subtitle: currentNetwork?.symbol || 'ETH',
                    usdValue: showBalance ? (usdBalance !== 'Price unavailable' ? `≈ $${usdBalance}` : 'Price unavailable') : '••••••',
                    icon: CustomIcons.Wallet,
                    color: 'from-blue-500 to-blue-600',
                    bgColor: 'from-blue-50 to-blue-100',
                    iconColor: 'text-blue-600',
                    change: '+2.4%'
                  },
                  {
                    title: 'Active Network',
                    value: currentNetwork?.name || 'Not Connected',
                    subtitle: `Chain ID: ${currentNetwork?.chainId || 'N/A'}`,
                    icon: CustomIcons.Globe,
                    color: 'from-green-500 to-green-600',
                    bgColor: 'from-green-50 to-green-100',
                    iconColor: 'text-green-600',
                    change: 'Connected'
                  },
                  {
                    title: 'Security Status',
                    value: isUnlocked ? 'Secured' : 'Locked',
                    subtitle: isUnlocked ? 'Wallet Unlocked' : 'Wallet Locked',
                    icon: CustomIcons.Shield,
                    color: isUnlocked ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600',
                    bgColor: isUnlocked ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100',
                    iconColor: isUnlocked ? 'text-green-600' : 'text-red-600',
                    change: isUnlocked ? 'Active' : 'Inactive'
                  },
                  {
                    title: 'Custom Tokens',
                    value: customTokens.length.toString(),
                    subtitle: 'ERC-20 Tokens',
                    icon: CustomIcons.Star,
                    color: 'from-purple-500 to-purple-600',
                    bgColor: 'from-purple-50 to-purple-100',
                    iconColor: 'text-purple-600',
                    change: '+1 today'
                  }
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  const handleCardClick = () => {
                    switch (index) {
                      case 0: // Total Balance - refresh balance
                        handleRefreshBalance();
                        break;
                      case 1: // Active Network - go to networks page
                        router.push('/networks');
                        break;
                      case 2: // Security Status - go to account management
                        router.push('/account');
                        break;
                      case 3: // Custom Tokens - go to tokens page
                        router.push('/tokens');
                        break;
                    }
                  };
                  
                  return (
                    <div 
                      key={index} 
                      onClick={handleCardClick}
                      className="megapayer-panel p-4 hover:shadow-megapayer transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up group cursor-pointer rounded-xl"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${stat.bgColor} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                        </div>
                        <span className="text-xs font-medium text-megapayer-muted bg-megapayer-panel-soft px-2 py-1 rounded-full">
                          {stat.change}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-megapayer-muted mb-1">{stat.title}</p>
                        <p className="text-xl font-bold text-megapayer-text mb-1">{stat.value}</p>
                        <p className="text-sm text-megapayer-muted">{stat.subtitle}</p>
                        {stat.usdValue && (
                          <p className="text-sm text-megapayer-muted mt-1">{stat.usdValue}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 megapayer-panel p-4 animate-fade-in-up rounded-xl">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRefreshBalance}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 megapayer-btn-primary rounded-lg disabled:opacity-50 transition-all duration-300 hover:scale-105 text-sm"
                  >
                    <CustomIcons.Refresh className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} spinning={isRefreshing} />
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="flex items-center gap-2 px-4 py-2 megapayer-btn-primary rounded-lg transition-all duration-300 hover:scale-105 group text-sm"
                  >
                    {showBalance ? <CustomIcons.EyeOff className="w-4 h-4 group-hover:scale-110 transition-transform" /> : <CustomIcons.Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    <span className="font-semibold text-sm">{showBalance ? 'Hide' : 'Show'} Balance</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-megapayer-muted">
                  <CustomIcons.Clock className="w-4 h-4" />
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
              {/* Portfolio Section */}
              <div className="megapayer-panel p-5 animate-fade-in-up rounded-xl">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-megapayer-emerald to-megapayer-teal rounded-lg flex items-center justify-center shadow-md">
                      <CustomIcons.PieChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-megapayer-text font-heading">Portfolio</h3>
                      <p className="text-megapayer-muted text-sm">Your token holdings and balances</p>
                    </div>
                  </div>
                  <Link
                    href="/tokens"
                    className="flex items-center gap-2 px-3 py-2 megapayer-btn-primary rounded-lg hover:scale-105 shadow-md whitespace-nowrap"
                  >
                    <CustomIcons.Plus className="w-3.5 h-3.5" />
                    <span className="font-semibold text-xs">Add Token</span>
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {/* Native Token */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
                        {nativeTokenLogo ? (
                          <img
                            src={nativeTokenLogo}
                            alt={`${currentNetwork?.symbol} logo`}
                            className="w-12 h-12 rounded-xl"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = generateFallbackIcon(currentNetwork?.symbol || 'ETH', 56);
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {currentNetwork?.symbol?.charAt(0) || 'E'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{currentNetwork?.symbol || 'ETH'}</h4>
                        <p className="text-gray-600 text-sm">{currentNetwork?.name || 'Ethereum'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-base">
                        {showBalance ? (balance ? parseFloat(balance).toFixed(4) : '0.0000') : '••••••'}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {showBalance ? (usdBalance !== 'Price unavailable' ? `≈ $${usdBalance}` : 'Price unavailable') : '••••••'}
                      </p>
                    </div>
                  </div>

                  {customTokens.length > 0 ? (
                    customTokens.map((token, index) => (
                      <div key={token.address} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {token.logoUrl ? (
                              <img
                                src={token.logoUrl}
                                alt={`${token.symbol} logo`}
                                className="w-12 h-12 rounded-xl shadow-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = generateFallbackIcon(token.symbol, 40);
                                }}
                              />
                            ) : (
                              <img
                                src={generateFallbackIcon(token.symbol, 40)}
                                alt={`${token.symbol} generated icon`}
                                className="w-12 h-12 rounded-xl shadow-md"
                              />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-base">{token.symbol}</h4>
                            <p className="text-gray-600 text-sm">{token.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-base">0.0000</p>
                          <p className="text-gray-600 text-sm">$0.00</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <CustomIcons.Zap className="w-7 h-7 text-gray-400" />
                      </div>
                      <h4 className="text-base font-bold text-gray-900 mb-2">No Custom Tokens</h4>
                      <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">Add custom tokens to track your complete portfolio.</p>
                      <Link
                        href="/tokens"
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105 text-sm"
                      >
                        <CustomIcons.Plus className="w-4 h-4 mr-2" />
                        Add Your First Token
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              </div>
            </div>
        );
      }