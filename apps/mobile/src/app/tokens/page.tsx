'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { getTokenIcon, generateFallbackIcon } from '@/lib/tokenIconService';
import { updateAllTokenLogos, updateMissingLogos, getLogoStats, clearCacheAndRefresh } from '@/lib/tokenLogoManager';
import { cleanupDuplicateTokens } from '@/lib/cleanupDuplicates';
import { motion, AnimatePresence } from 'framer-motion';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance?: string;
  usdValue?: string;
  logoUrl?: string;
}

// Beautiful SVG Graphics for Tokens Page
const TokenIcon = () => (
  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tokenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <filter id="glowToken">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Circle */}
    <circle cx="70" cy="70" r="65" fill="rgba(34, 225, 255, 0.08)" />
    
    {/* Token Coin */}
    <motion.g
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Outer Coin */}
      <circle cx="70" cy="70" r="35" fill="none" stroke="url(#tokenGradient)" strokeWidth="4" filter="url(#glowToken)" />
      
      {/* Inner Coin Design */}
      <circle cx="70" cy="70" r="25" fill="rgba(34, 225, 255, 0.1)" />
      <path
        d="M55 70 Q70 55 85 70 Q70 85 55 70"
        fill="none"
        stroke="url(#tokenGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      
      {/* Token Symbol */}
      <text x="70" y="76" textAnchor="middle" fill="url(#tokenGradient)" fontSize="16" fontWeight="bold">$</text>
    </motion.g>
    
    {/* Floating Tokens */}
    {[...Array(5)].map((_, i) => {
      const angle = (i * 72) * Math.PI / 180;
      const radius = 50;
      const x = 70 + Math.cos(angle) * radius;
      const y = 70 + Math.sin(angle) * radius;
      return (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="4"
          fill="#7C3AED"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0]
          }}
          transition={{
            delay: 0.6 + i * 0.15,
            duration: 2.5,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

export default function TokensPage() {
  const router = useRouter();
  const {
    address,
    isUnlocked,
    isInitialized,
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
  const [showAddForm, setShowAddForm] = useState(false);
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
    if (isInitialized && !isUnlocked) {
      router.push('/unlock');
    }
  }, [isInitialized, isUnlocked, router]);

  useEffect(() => {
    cleanupDuplicateTokens();
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
    
    const timeoutId = setTimeout(autoUpdateLogos, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  const loadTokens = () => {
    if (!currentNetwork?.chainId) {
      setTokens([]);
      return;
    }
    
    const oldTokenKey = 'mpc-wallet-tokens';
    const networkKey = `mpc-wallet-tokens-${currentNetwork.chainId}`;
    
    const oldTokens = localStorage.getItem(oldTokenKey);
    const existingNewTokens = localStorage.getItem(networkKey);
    
    if (oldTokens && !existingNewTokens) {
      console.log(`🔄 Migrating tokens to network-specific storage for network ${currentNetwork.chainId}`);
      localStorage.setItem(networkKey, oldTokens);
      console.log(`✅ Migrated tokens to ${networkKey}`);
    }
    
    const storedTokens = localStorage.getItem(networkKey);
    if (storedTokens) {
      let tokens = JSON.parse(storedTokens);
      
      const nativeTokens = tokens.filter((token: any) => token.address === '');
      const customTokens = tokens.filter((token: any) => token.address !== '');
      
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

  const handleUpdateMissingLogos = async () => {
    setIsUpdatingLogos(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await updateMissingLogos();
      if (result.success) {
        if (result.updatedCount > 0) {
          setSuccess(result.message);
          loadTokens();
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

  const handleAddToken = async () => {
    if (!newTokenAddress.trim()) {
      setError('Please enter a token contract address');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newTokenAddress.trim())) {
      setError('Invalid contract address format');
      return;
    }

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
        
        if (currentNetwork?.chainId) {
          const networkKey = `mpc-wallet-tokens-${currentNetwork.chainId}`;
          localStorage.setItem(networkKey, JSON.stringify(updatedTokens));
        }
        setNewTokenAddress('');
        setShowAddForm(false);
        setSuccess(`Successfully added ${metadata.symbol}`);
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
    
    if (currentNetwork?.chainId) {
      const networkKey = `mpc-wallet-tokens-${currentNetwork.chainId}`;
      localStorage.setItem(networkKey, JSON.stringify(updatedTokens));
    }
    setSuccess('Token removed successfully');
    setTimeout(() => setSuccess(''), 3000);
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

  if (!isInitialized || !isUnlocked) {
    return null;
  }

  return (
    <div className="min-h-screen megapayer-bg flex flex-col relative overflow-hidden pb-24">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-8"
          style={{
            background: `linear-gradient(135deg, rgba(124,58,237,0.2), rgba(34,225,255,0.15))`
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header Section */}
      <div className="px-5 pt-6 pb-3 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#22E1FF15] flex-shrink-0">
            <TokenIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-heading text-megapayer-text">Tokens</h1>
            <p className="text-sm font-body text-megapayer-muted mt-0.5">
              {tokens.length} {tokens.length === 1 ? 'token' : 'tokens'} imported
            </p>
          </div>
        </motion.div>
      </div>

      {/* Add Token Section */}
      <div className="px-5 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="megapayer-panel rounded-2xl border border-megapayer-border overflow-hidden"
        >
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center justify-between p-4 hover:bg-megapayer-panel-soft transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#22E1FF15] flex-shrink-0">
                <CustomIcons.Plus className="w-4 h-4 text-[#22E1FF]" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-sm font-semibold font-heading text-megapayer-text">Import Token</h3>
                <p className="text-xs font-body text-megapayer-muted mt-0.5">Add custom ERC-20 token</p>
              </div>
            </div>
            <CustomIcons.ChevronRight className={`w-4 h-4 text-megapayer-muted flex-shrink-0 transition-transform ${showAddForm ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-2 space-y-4 border-t border-megapayer-border">
                  <div>
                    <label className="block text-xs font-semibold font-heading text-megapayer-text mb-2">
                      Token Contract Address
                    </label>
                    <input
                      type="text"
                      value={newTokenAddress}
                      onChange={(e) => {
                        setNewTokenAddress(e.target.value);
                        setError('');
                      }}
                      placeholder="0x..."
                      className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal text-megapayer-text placeholder-megapayer-muted font-mono text-sm"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 megapayer-panel-soft border border-red-400/30 rounded-xl"
                    >
                      <CustomIcons.AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <p className="text-xs font-body text-red-500">{error}</p>
                    </motion.div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 megapayer-panel-soft border border-megapayer-emerald/30 rounded-xl"
                    >
                      <CustomIcons.CheckCircle className="h-4 w-4 text-megapayer-emerald flex-shrink-0" />
                      <p className="text-xs font-body text-megapayer-emerald">{success}</p>
                    </motion.div>
                  )}

                  <motion.button
                    onClick={handleAddToken}
                    disabled={!newTokenAddress.trim() || isAddingToken}
                    whileHover={{ scale: isAddingToken || !newTokenAddress.trim() ? 1 : 1.02 }}
                    whileTap={{ scale: isAddingToken || !newTokenAddress.trim() ? 1 : 0.98 }}
                    className="w-full megapayer-btn-primary py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold font-heading flex items-center justify-center gap-2"
                  >
                    {isAddingToken ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <CustomIcons.Plus className="w-4 h-4" />
                        Add Token
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Search Section */}
      {tokens.length > 0 && (
        <div className="px-5 pb-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <CustomIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-megapayer-muted z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tokens..."
              className="w-full pl-10 pr-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal text-megapayer-text placeholder-megapayer-muted font-body"
            />
          </motion.div>
        </div>
      )}

      {/* Tokens List */}
      <div className="px-5 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="megapayer-panel rounded-2xl border border-megapayer-border overflow-hidden"
        >
          {filteredTokens.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-megapayer-panel-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CustomIcons.Star className="w-8 h-8 text-megapayer-muted" />
              </div>
              <h3 className="text-base font-bold font-heading text-megapayer-text mb-2">
                {searchQuery ? 'No tokens found' : 'No tokens yet'}
              </h3>
              <p className="text-sm font-body text-megapayer-muted">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Import a token to get started'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-megapayer-border">
              {filteredTokens.map((token, index) => (
                <motion.div
                  key={token.address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-megapayer-panel-soft transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Token Logo */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-megapayer-panel-soft">
                      {token.logoUrl ? (
                        <img
                          src={token.logoUrl}
                          alt={`${token.symbol} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = generateFallbackIcon(token.symbol, 48);
                          }}
                        />
                      ) : (
                        <img
                          src={generateFallbackIcon(token.symbol, 48)}
                          alt={`${token.symbol} icon`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Token Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold font-heading text-megapayer-text truncate">
                        {token.symbol}
                      </h3>
                      <p className="text-xs font-body text-megapayer-muted truncate mt-0.5">
                        {token.name}
                      </p>
                      <p className="text-xs font-mono font-body text-megapayer-muted truncate mt-1">
                        {token.address.slice(0, 8)}...{token.address.slice(-6)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <motion.button
                        onClick={() => handleCopy(token.address, token.address)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-megapayer-panel rounded-lg transition-colors"
                        title="Copy address"
                      >
                        <CustomIcons.Copy className={`w-4 h-4 ${copied === token.address ? 'text-megapayer-emerald' : 'text-megapayer-muted'}`} />
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleRemoveToken(token.address)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove token"
                      >
                        <CustomIcons.Trash2 className="w-4 h-4 text-red-400" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
