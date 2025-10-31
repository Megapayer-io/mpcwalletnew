'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { Layout } from '@/components/layout/Layout';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { getTokenIcon, generateFallbackIcon } from '@/lib/tokenIconService';
import { updateAllTokenLogos, updateMissingLogos, getLogoStats, clearCacheAndRefresh } from '@/lib/tokenLogoManager';
import { cleanupDuplicateTokens } from '@/lib/cleanupDuplicates';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance?: string;
  usdValue?: string;
  logoUrl?: string;
}

export default function TokensPage() {
  const router = useRouter();
  const {
    address,
    isUnlocked,
    currentNetwork,
    getTokenMetadata,
    getTokenBalance,
    getTokenPrice,
    getUsdBalance
  } = useWalletStore();
  
  const [tokens, setTokens] = useState<Token[]>([]);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUpdatingLogos, setIsUpdatingLogos] = useState(false);
  const [logoStats, setLogoStats] = useState({
    totalTokens: 0,
    tokensWithLogos: 0,
    tokensWithoutLogos: 0,
    lastUpdate: null as Date | null,
    needsUpdate: false
  });

  // Redirect to unlock page if wallet is locked
  useEffect(() => {
    if (!isUnlocked) {
      router.push('/unlock');
    }
  }, [isUnlocked, router]);

  useEffect(() => {
    cleanupDuplicateTokens(); // Clean up duplicates first
    loadTokens();
    updateLogoStats();
    
    // Automatically update missing logos when page loads
    const autoUpdateLogos = async () => {
      const stats = getLogoStats();
      if (stats.tokensWithoutLogos > 0) {
        console.log(`🔄 Auto-updating logos for ${stats.tokensWithoutLogos} tokens...`);
        await handleUpdateMissingLogos();
      }
    };
    
    // Run auto-update after a short delay
    const timeoutId = setTimeout(autoUpdateLogos, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  const loadTokens = () => {
    if (!currentNetwork?.chainId) {
      setTokens([]);
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
    if (storedTokens) {
      let tokens = JSON.parse(storedTokens);
      
      // Remove duplicate native tokens (address === '')
      const nativeTokens = tokens.filter((token: any) => token.address === '');
      const customTokens = tokens.filter((token: any) => token.address !== '');
      
      // If there are multiple native tokens, keep only the first one
      if (nativeTokens.length > 1) {
        tokens = [nativeTokens[0], ...customTokens];
        localStorage.setItem(networkKey, JSON.stringify(tokens));
      }
      
      setTokens(tokens);
    } else {
      setTokens([]);
    }
  };

  const updateLogoStats = () => {
    const stats = getLogoStats();
    setLogoStats(stats);
  };

  const handleUpdateAllLogos = async () => {
    setIsUpdatingLogos(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await updateAllTokenLogos();
      if (result.success) {
        setSuccess(result.message);
        loadTokens(); // Reload tokens to show updated logos
        updateLogoStats();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Failed to update logos:', error);
      setError('Failed to update token logos. Please try again.');
    } finally {
      setIsUpdatingLogos(false);
    }
  };

  const handleUpdateMissingLogos = async () => {
    setIsUpdatingLogos(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await updateMissingLogos();
      if (result.success) {
        if (result.updatedCount > 0) {
          setSuccess(result.message);
          loadTokens(); // Reload tokens to show updated logos
          updateLogoStats();
          setTimeout(() => setSuccess(''), 5000);
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Failed to update missing logos:', error);
      setError('Failed to update missing token logos. Please try again.');
    } finally {
      setIsUpdatingLogos(false);
    }
  };

  const handleClearCacheAndRefresh = async () => {
    setIsUpdatingLogos(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await clearCacheAndRefresh();
      if (result.success) {
        setSuccess(result.message);
        loadTokens(); // Reload tokens to show updated logos
        updateLogoStats();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Failed to clear cache and refresh:', error);
      setError('Failed to refresh token logos. Please try again.');
    } finally {
      setIsUpdatingLogos(false);
    }
  };

  const handleAddToken = async () => {
    if (!newTokenAddress.trim()) {
      setError('Please enter a token contract address');
      return;
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(newTokenAddress.trim())) {
      setError('Invalid contract address format');
      return;
    }

    // Check if token already exists
    if (tokens.some(token => token.address.toLowerCase() === newTokenAddress.toLowerCase())) {
      setError('Token already added to your list');
      return;
    }
    
    setIsAddingToken(true);
    setError('');
    setSuccess('');
    
    try {
      const metadata = await getTokenMetadata(newTokenAddress);
      if (metadata) {
        // Try to get token icon using the new service
        const iconResult = await getTokenIcon(metadata.symbol, newTokenAddress);
        
        const newToken: Token = {
          address: newTokenAddress,
          symbol: metadata.symbol,
          name: metadata.name,
          decimals: metadata.decimals,
          logoUrl: iconResult.url || undefined
        };
        
        const updatedTokens = [...tokens, newToken];
        setTokens(updatedTokens);
        
        // Save to network-specific storage
        if (currentNetwork?.chainId) {
          const networkKey = `mpc-wallet-tokens-${currentNetwork.chainId}`;
          localStorage.setItem(networkKey, JSON.stringify(updatedTokens));
        }
        setNewTokenAddress('');
        setSuccess(`Successfully added ${metadata.symbol} (${metadata.name})${iconResult.url ? ` with icon from ${iconResult.source}` : ''}`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to fetch token metadata. Please check the contract address.');
      }
    } catch (error) {
      console.error('Failed to add token:', error);
      setError('Failed to add token. Please check the contract address and try again.');
    } finally {
      setIsAddingToken(false);
    }
  };

  const handleRemoveToken = (tokenAddress: string) => {
    const updatedTokens = tokens.filter(token => token.address !== tokenAddress);
    setTokens(updatedTokens);
    
    // Save to network-specific storage
    if (currentNetwork?.chainId) {
      const networkKey = `mpc-wallet-tokens-${currentNetwork.chainId}`;
      localStorage.setItem(networkKey, JSON.stringify(updatedTokens));
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading while redirecting
  if (!isUnlocked) {
    return (
      <Layout title="Token Management">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-megapayer-teal via-megapayer-violet to-megapayer-accent rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CustomIcons.Star className="w-10 h-10 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-megapayer-text mb-2">Redirecting to unlock page...</h1>
          <p className="text-megapayer-muted">
            Please wait while we redirect you to unlock your wallet.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Token Management">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="megapayer-panel p-8 text-megapayer-text relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-megapayer-accent/10 via-megapayer-violet/10 to-megapayer-emerald/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-megapayer-accent to-megapayer-emerald rounded-2xl flex items-center justify-center shadow-lg">
                  <CustomIcons.Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2 font-heading text-megapayer-text">Token Management</h1>
                  <p className="text-megapayer-muted text-lg">Add custom ERC-20 tokens to your wallet</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-megapayer-muted text-sm mb-1">Total Tokens</p>
                <p className="text-4xl font-bold text-megapayer-text">{tokens.length}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <div className="w-3 h-3 bg-megapayer-emerald rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-megapayer-emerald">Active</span>
                </div>
                {logoStats.tokensWithoutLogos > 0 && (
                  <div className="mt-2 text-xs text-megapayer-muted">
                    {logoStats.tokensWithoutLogos} tokens using fallback icons
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-megapayer-accent/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-megapayer-emerald/5 rounded-full"></div>
        </div>

        {/* Add Token Form */}
        <div className="megapayer-panel p-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-megapayer-accent to-megapayer-violet rounded-xl flex items-center justify-center shadow-lg">
              <CustomIcons.Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-megapayer-text font-heading">Add Custom Token</h2>
              <p className="text-megapayer-muted">Import ERC-20 tokens by contract address</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-megapayer-text mb-3">
                Token Contract Address
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newTokenAddress}
                  onChange={(e) => setNewTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 px-4 py-3 megapayer-panel-soft border border-megapayer-border-soft rounded-xl focus:outline-none focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal/50 text-megapayer-text"
                />
                <button
                  onClick={handleAddToken}
                  disabled={!newTokenAddress.trim() || isAddingToken}
                  className="px-6 py-3 megapayer-btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center gap-2 font-semibold"
                >
                  {isAddingToken ? (
                    <CustomIcons.Refresh className="h-4 w-4 animate-spin" />
                  ) : (
                    <CustomIcons.Plus className="h-4 w-4" />
                  )}
                  {isAddingToken ? 'Adding...' : 'Add Token'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-accent/20 bg-megapayer-accent/5">
                <div className="flex items-start gap-4">
                  <CustomIcons.AlertTriangle className="h-5 w-5 text-megapayer-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-megapayer-text mb-2">Error</h3>
                    <p className="text-sm text-megapayer-muted">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-emerald/20 bg-megapayer-emerald/5">
                <div className="flex items-start gap-4">
                  <CustomIcons.CheckCircle className="h-5 w-5 text-megapayer-emerald mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-megapayer-text mb-2">Success</h3>
                    <p className="text-sm text-megapayer-muted">{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft">
              <div className="flex items-start gap-4">
                <CustomIcons.AlertTriangle className="h-5 w-5 text-megapayer-teal mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-megapayer-text mb-2">How to find token addresses</h3>
                  <p className="text-sm text-megapayer-muted mb-3">
                    You can find token contract addresses on block explorers like{' '}
                    <a
                      href={currentNetwork?.blockExplorer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-megapayer-teal hover:text-megapayer-violet underline font-medium"
                    >
                      {currentNetwork?.blockExplorer}
                    </a>
                    {' '}or token listing websites.
                  </p>
                  <p className="text-sm text-megapayer-muted">
                    Token icons will be automatically fetched when available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Token List */}
        <div className="megapayer-panel p-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-emerald to-megapayer-teal rounded-xl flex items-center justify-center shadow-lg">
                <CustomIcons.Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-megapayer-text font-heading">Your Tokens</h2>
                <p className="text-megapayer-muted">{tokens.length} custom tokens added</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <CustomIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-megapayer-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tokens..."
                  className="pl-10 pr-4 py-3 megapayer-panel-soft border border-megapayer-border-soft rounded-xl focus:outline-none focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal/50 text-megapayer-text"
                />
              </div>
              <button
                onClick={loadTokens}
                className="p-3 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
                title="Refresh tokens"
              >
                <CustomIcons.Refresh className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {filteredTokens.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CustomIcons.Star className="w-10 h-10 text-megapayer-muted" />
              </div>
              <h3 className="text-xl font-bold text-megapayer-text mb-3 font-heading">No Tokens Found</h3>
              <p className="text-megapayer-muted mb-6">
                {searchQuery ? 'No tokens match your search.' : 'You haven\'t added any custom tokens yet.'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-megapayer-muted">
                  Add a token contract address above to get started.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTokens.map((token, index) => (
                <div
                  key={token.address}
                  className="megapayer-panel-soft p-6 rounded-xl border border-megapayer-border-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {token.logoUrl ? (
                          <img
                            src={token.logoUrl}
                            alt={`${token.symbol} logo`}
                            className="w-12 h-12 rounded-xl shadow-lg"
                            onError={(e) => {
                              // Fallback to generated icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = generateFallbackIcon(token.symbol, 48);
                            }}
                          />
                        ) : (
                          <img
                            src={generateFallbackIcon(token.symbol, 48)}
                            alt={`${token.symbol} generated icon`}
                            className="w-12 h-12 rounded-xl shadow-lg"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-megapayer-text text-lg">{token.symbol}</h3>
                        <p className="text-sm text-megapayer-muted">{token.name}</p>
                        <p className="text-xs text-megapayer-muted font-mono mt-1">
                          {token.address.slice(0, 6)}...{token.address.slice(-4)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-megapayer-muted">{token.decimals} decimals</p>
                        {token.balance && (
                          <p className="text-sm font-semibold text-megapayer-text">{token.balance}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(token.address, token.address)}
                          className="p-3 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
                          title="Copy contract address"
                        >
                          {copied === token.address ? <CustomIcons.CheckCircle className="h-4 w-4 text-megapayer-emerald" /> : <CustomIcons.Copy className="h-4 w-4" />}
                        </button>
                        
                        {currentNetwork?.blockExplorer && (
                          <a
                            href={`${currentNetwork.blockExplorer}/token/${token.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
                            title="View on explorer"
                          >
                            <CustomIcons.ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        
                        <button
                          onClick={() => handleRemoveToken(token.address)}
                          className="p-3 text-megapayer-muted hover:text-megapayer-accent hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
                          title="Remove token"
                        >
                          <CustomIcons.Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}