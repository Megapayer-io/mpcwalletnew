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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-megapayer-teal via-megapayer-violet to-megapayer-accent rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
            <CustomIcons.Wallet className="w-10 h-10 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Initializing wallet...</p>
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
          <div className="space-y-4">
              {/* Welcome Header - Compact */}
              <div className="megapayer-panel p-4 text-megapayer-text relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-megapayer-teal/10 via-megapayer-violet/10 to-megapayer-accent/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src="/megapayer-logo.svg" alt="Megapayer logo" className="w-8 h-8" />
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-megapayer-emerald rounded-full border border-megapayer-panel animate-pulse"></div>
                      </div>
                      <div>
                        <h1 className="text-xl font-bold mb-0.5 font-heading text-megapayer-text">Welcome back!</h1>
                        <p className="text-megapayer-muted text-sm">Your Web3 portfolio overview</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-megapayer-muted text-xs mb-0.5">Portfolio Value</p>
                      <p 
                        className="text-2xl font-bold cursor-pointer hover:scale-105 transition-transform duration-200 text-megapayer-text"
                        onClick={handleRefreshBalance}
                        title="Click to refresh portfolio value"
                      >
                        {showBalance ? `$${portfolioValue}` : '••••••'}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        {portfolioChange > 0 ? (
                          <CustomIcons.TrendingUp className="w-3 h-3 text-megapayer-emerald" />
                        ) : (
                          <CustomIcons.TrendingDown className="w-3 h-3 text-megapayer-accent" />
                        )}
                        <span className={`text-xs font-medium ${portfolioChange > 0 ? 'text-megapayer-emerald' : 'text-megapayer-accent'}`}>
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
                      className="megapayer-panel p-3 hover:shadow-megapayer transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up group cursor-pointer rounded-xl"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 bg-gradient-to-br ${stat.bgColor} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                        </div>
                        <span className="text-xs font-medium text-megapayer-muted bg-megapayer-panel-soft px-1.5 py-0.5 rounded-full text-[10px]">
                          {stat.change}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-megapayer-muted mb-0.5">{stat.title}</p>
                        <p className="text-lg font-bold text-megapayer-text mb-0.5">{stat.value}</p>
                        <p className="text-xs text-megapayer-muted">{stat.subtitle}</p>
                        {stat.usdValue && (
                          <p className="text-xs text-megapayer-muted mt-0.5">{stat.usdValue}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Bar - Compact */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 megapayer-panel p-3 animate-fade-in-up rounded-xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefreshBalance}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 px-3 py-1.5 megapayer-btn-primary rounded-lg disabled:opacity-50 transition-all duration-300 hover:scale-105 text-xs"
                  >
                    <CustomIcons.Refresh className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} spinning={isRefreshing} />
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="flex items-center gap-1.5 px-3 py-1.5 megapayer-btn-primary rounded-lg transition-all duration-300 hover:scale-105 group text-xs"
                  >
                    {showBalance ? <CustomIcons.EyeOff className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> : <CustomIcons.Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />}
                    <span className="font-semibold text-xs">{showBalance ? 'Hide' : 'Show'} Balance</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-megapayer-muted">
                  <CustomIcons.Clock className="w-3 h-3" />
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Quick Actions - Compact */}
              <div className="megapayer-panel p-4 animate-fade-in-up rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-megapayer-teal to-megapayer-violet rounded-lg flex items-center justify-center shadow-md">
                      <CustomIcons.Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-megapayer-text font-heading">Quick Actions</h3>
                      <p className="text-megapayer-muted text-xs">Access your most used features</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={index}
                        href={action.href}
                        className={`${action.bgColor} ${action.hoverColor} rounded-xl p-3 transition-all duration-300 hover:shadow-lg group hover:-translate-y-0.5 animate-fade-in-up border border-gray-200/50`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 ${action.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                            <Icon className={`w-4 h-4 ${action.iconColor}`} />
                          </div>
                          <CustomIcons.ArrowUpRight className={`w-4 h-4 ${action.iconColor} opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1`} />
                        </div>
                        <h4 className={`font-bold ${action.textColor} mb-1 text-sm`}>{action.title}</h4>
                        <p className="text-xs text-gray-600 font-medium">{action.description}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Portfolio Section - Compact */}
              <div className="megapayer-panel p-4 animate-fade-in-up rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-megapayer-emerald to-megapayer-teal rounded-lg flex items-center justify-center shadow-md">
                      <CustomIcons.PieChart className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-megapayer-text font-heading">Portfolio</h3>
                      <p className="text-megapayer-muted text-xs">Your token holdings and balances</p>
                    </div>
                  </div>
                  <Link
                    href="/tokens"
                    className="flex items-center gap-1.5 px-3 py-1.5 megapayer-btn-primary rounded-lg hover:scale-105 shadow-md text-xs"
                  >
                    <CustomIcons.Plus className="w-3.5 h-3.5" />
                    <span className="font-semibold text-xs">Add Token</span>
                  </Link>
                </div>
                
                <div className="space-y-2">
                  {/* Native Token */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
                        {nativeTokenLogo ? (
                          <img
                            src={nativeTokenLogo}
                            alt={`${currentNetwork?.symbol} logo`}
                            className="w-10 h-10 rounded-xl"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = generateFallbackIcon(currentNetwork?.symbol || 'ETH', 56);
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {currentNetwork?.symbol?.charAt(0) || 'E'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{currentNetwork?.symbol || 'ETH'}</h4>
                        <p className="text-gray-600 text-xs">{currentNetwork?.name || 'Ethereum'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        {showBalance ? (balance ? parseFloat(balance).toFixed(4) : '0.0000') : '••••••'}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {showBalance ? (usdBalance !== 'Price unavailable' ? `≈ $${usdBalance}` : 'Price unavailable') : '••••••'}
                      </p>
                    </div>
                  </div>

                  {customTokens.length > 0 ? (
                    customTokens.map((token, index) => (
                      <div key={token.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {token.logoUrl ? (
                              <img
                                src={token.logoUrl}
                                alt={`${token.symbol} logo`}
                                className="w-10 h-10 rounded-xl shadow-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = generateFallbackIcon(token.symbol, 40);
                                }}
                              />
                            ) : (
                              <img
                                src={generateFallbackIcon(token.symbol, 40)}
                                alt={`${token.symbol} generated icon`}
                                className="w-10 h-10 rounded-xl shadow-md"
                              />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{token.symbol}</h4>
                            <p className="text-gray-600 text-xs">{token.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">0.0000</p>
                          <p className="text-gray-600 text-xs">$0.00</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <CustomIcons.Zap className="w-6 h-6 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-2">No Custom Tokens</h4>
                      <p className="text-gray-600 text-xs mb-4 max-w-md mx-auto">Add custom tokens to track your complete portfolio.</p>
                      <Link
                        href="/tokens"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105 text-xs"
                      >
                        <CustomIcons.Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add Your First Token
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
        );
      }