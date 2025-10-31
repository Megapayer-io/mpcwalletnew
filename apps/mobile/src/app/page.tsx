'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { Layout } from '@/components/layout/Layout';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Globe, 
  Image, 
  History, 
  TrendingUp,
  Shield,
  Wallet,
  Activity,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  ExternalLink,
  Send,
  Zap,
  Star,
  Sparkles,
  Plus,
  DollarSign,
  TrendingDown,
  BarChart3,
  PieChart,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [usdBalance, setUsdBalance] = useState<string>('0.00');
  const [isLoadingUsd, setIsLoadingUsd] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [customTokens, setCustomTokens] = useState<any[]>([]);
  const [portfolioValue, setPortfolioValue] = useState<string>('0.00');
  const [portfolioChange, setPortfolioChange] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
      loadCustomTokens();
    }
  }, [isUnlocked, address, getBalance]);

  const loadCustomTokens = () => {
    const storedTokens = localStorage.getItem('mpc-wallet-tokens');
    if (storedTokens) {
      setCustomTokens(JSON.parse(storedTokens));
    }
  };

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

  // Update portfolio value when USD balance changes
  useEffect(() => {
    if (usdBalance && usdBalance !== 'Price unavailable') {
      const currentUsdValue = parseFloat(usdBalance) || 0;
      setPortfolioValue(currentUsdValue.toFixed(2));
    }
  }, [usdBalance]);

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

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
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
            <Wallet className="w-10 h-10 text-white" />
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
      icon: ArrowUpRight,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
      hoverColor: 'hover:from-red-100 hover:to-pink-100',
      textColor: 'text-red-700',
      iconColor: 'text-red-600'
    },
    {
      title: 'Receive Funds',
      description: 'Get your wallet address',
      href: '/receive',
      icon: ArrowDownLeft,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      hoverColor: 'hover:from-green-100 hover:to-emerald-100',
      textColor: 'text-green-700',
      iconColor: 'text-green-600'
    },
    {
      title: 'DApp Browser',
      description: 'Explore Web3 applications',
      href: '/browser',
      icon: Globe,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
      hoverColor: 'hover:from-purple-100 hover:to-indigo-100',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-600'
    },
    {
      title: 'View NFTs',
      description: 'Manage your NFT collection',
      href: '/nfts',
      icon: Image,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50',
      hoverColor: 'hover:from-pink-100 hover:to-rose-100',
      textColor: 'text-pink-700',
      iconColor: 'text-pink-600'
    }
  ];

  const stats = [
    {
      title: 'Total Balance',
      value: showBalance ? (balance ? parseFloat(balance).toFixed(4) : '0.0000') : '••••••',
      subtitle: currentNetwork?.symbol || 'ETH',
      usdValue: showBalance ? (usdBalance !== 'Price unavailable' ? `≈ $${usdBalance}` : 'Price unavailable') : '••••••',
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Network',
      value: currentNetwork?.name || 'Not Connected',
      subtitle: 'Active Network',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Security',
      value: isUnlocked ? 'Unlocked' : 'Locked',
      subtitle: 'Wallet Status',
      icon: Shield,
      color: isUnlocked ? 'text-green-600' : 'text-red-600',
      bgColor: isUnlocked ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-red-50 to-red-100',
      gradient: isUnlocked ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'
    }
  ];

        return (
          <Layout title="Dashboard" subtitle="Professional Web3 Portfolio Management">
            <div className="space-y-8">
              {/* Welcome Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
                      <p className="text-blue-100 text-lg">Your Web3 portfolio overview</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-100 text-sm mb-1">Portfolio Value</p>
                      <p 
                        className="text-4xl font-bold cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={handleRefreshBalance}
                        title="Click to refresh portfolio value"
                      >
                        {showBalance ? `$${portfolioValue}` : '••••••'}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {portfolioChange > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-300" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-300" />
                        )}
                        <span className={`text-sm font-medium ${portfolioChange > 0 ? 'text-green-300' : 'text-red-300'}`}>
                          {showBalance ? `${portfolioChange > 0 ? '+' : ''}${portfolioChange}%` : '••••'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: 'Total Balance',
                    value: showBalance ? (balance ? parseFloat(balance).toFixed(4) : '0.0000') : '••••••',
                    subtitle: currentNetwork?.symbol || 'ETH',
                    usdValue: showBalance ? (usdBalance !== 'Price unavailable' ? `≈ $${usdBalance}` : 'Price unavailable') : '••••••',
                    icon: Wallet,
                    color: 'from-blue-500 to-blue-600',
                    bgColor: 'from-blue-50 to-blue-100',
                    iconColor: 'text-blue-600',
                    change: '+2.4%'
                  },
                  {
                    title: 'Active Network',
                    value: currentNetwork?.name || 'Not Connected',
                    subtitle: `Chain ID: ${currentNetwork?.chainId || 'N/A'}`,
                    icon: Activity,
                    color: 'from-green-500 to-green-600',
                    bgColor: 'from-green-50 to-green-100',
                    iconColor: 'text-green-600',
                    change: 'Connected'
                  },
                  {
                    title: 'Security Status',
                    value: isUnlocked ? 'Secured' : 'Locked',
                    subtitle: isUnlocked ? 'Wallet Unlocked' : 'Wallet Locked',
                    icon: Shield,
                    color: isUnlocked ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600',
                    bgColor: isUnlocked ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100',
                    iconColor: isUnlocked ? 'text-green-600' : 'text-red-600',
                    change: isUnlocked ? 'Active' : 'Inactive'
                  },
                  {
                    title: 'Custom Tokens',
                    value: customTokens.length.toString(),
                    subtitle: 'ERC-20 Tokens',
                    icon: Star,
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
                      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up group cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.bgColor} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {stat.change}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                        <p className="text-sm text-gray-600">{stat.subtitle}</p>
                        {stat.usdValue && (
                          <p className="text-sm text-gray-500 mt-1">{stat.usdValue}</p>
                        )}
                      </div>
                      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs text-blue-600 font-medium">
                          {index === 0 ? 'Click to refresh' : 
                           index === 1 ? 'Click to manage networks' :
                           index === 2 ? 'Click to manage account' :
                           'Click to manage tokens'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6 animate-fade-in-up">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleRefreshBalance}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all duration-300 hover:scale-105"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 hover:scale-105"
                  >
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="font-medium">{showBalance ? 'Hide' : 'Show'} Balance</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-8 animate-fade-in-up">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
                      <p className="text-gray-600">Access your most used features</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={index}
                        href={action.href}
                        className={`${action.bgColor} ${action.hoverColor} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl group hover:-translate-y-1 animate-fade-in-up border border-gray-200/50`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            <Icon className={`w-6 h-6 ${action.iconColor}`} />
                          </div>
                          <ArrowUpRight className={`w-5 h-5 ${action.iconColor} opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1`} />
                        </div>
                        <h4 className={`font-bold ${action.textColor} mb-2 text-lg`}>{action.title}</h4>
                        <p className="text-sm text-gray-600 font-medium">{action.description}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Portfolio Section */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-8 animate-fade-in-up">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Portfolio</h3>
                      <p className="text-gray-600">Your token holdings and balances</p>
                    </div>
                  </div>
                  <Link
                    href="/tokens"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold">Add Token</span>
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {/* Native Token */}
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {currentNetwork?.symbol?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{currentNetwork?.symbol || 'ETH'}</h4>
                        <p className="text-gray-600">{currentNetwork?.name || 'Ethereum'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">
                        {showBalance ? (balance ? parseFloat(balance).toFixed(4) : '0.0000') : '••••••'}
                      </p>
                      <p className="text-gray-600">
                        {showBalance ? (usdBalance !== 'Price unavailable' ? `≈ $${usdBalance}` : 'Price unavailable') : '••••••'}
                      </p>
                    </div>
                  </div>

                  {/* Custom Tokens */}
                  {customTokens.length > 0 ? (
                    customTokens.map((token, index) => (
                      <div key={token.address} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {token.symbol.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{token.symbol}</h4>
                            <p className="text-gray-600">{token.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-lg">0.0000</p>
                          <p className="text-gray-600">$0.00</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-10 h-10 text-gray-400" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3">No Custom Tokens</h4>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">Add custom tokens to track your complete portfolio and get a comprehensive view of your holdings.</p>
                      <Link
                        href="/tokens"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Your First Token
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet Information */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-8 animate-fade-in-up">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Wallet Information</h3>
                      <p className="text-gray-600">Your wallet details and network status</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Wallet Address
                      </label>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-sm bg-gray-100/50 px-4 py-3 rounded-xl flex-1 border border-gray-200/50">
                          {address || 'No wallet connected'}
                        </span>
                        {address && (
                          <button
                            onClick={handleCopyAddress}
                            className="p-3 text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50"
                            title="Copy address"
                          >
                            {copied ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Network Status
                      </label>
                      <div className="flex items-center space-x-3">
                        <span className="px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm rounded-xl font-semibold border border-green-200/50">
                          {currentNetwork?.name || 'Not Connected'}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">
                          Chain ID: {currentNetwork?.chainId || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Security Status
                      </label>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUnlocked ? 'bg-green-100' : 'bg-red-100'}`}>
                          <Shield className={`w-6 h-6 ${isUnlocked ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{isUnlocked ? 'Wallet Secured' : 'Wallet Locked'}</p>
                          <p className="text-sm text-gray-600">{isUnlocked ? 'All features available' : 'Please unlock to continue'}</p>
                        </div>
                      </div>
                    </div>

                    {currentNetwork?.blockExplorer && address && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Block Explorer
                        </label>
                        <a
                          href={`${currentNetwork.blockExplorer}/address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300 font-medium"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View on Explorer</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-8 animate-fade-in-up">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
                      <p className="text-gray-600">Your latest transactions and interactions</p>
                    </div>
                  </div>
                  <Link
                    href="/history"
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors duration-300 font-semibold"
                  >
                    <span>View All</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
                
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <History className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">No Recent Activity</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Your transaction history and activity will appear here once you start using your wallet.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/send"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Send Transaction
                    </Link>
                    <Link
                      href="/receive"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <ArrowDownLeft className="w-5 h-5 mr-2" />
                      Receive Funds
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Layout>
        );
      }