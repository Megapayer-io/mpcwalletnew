'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { Layout } from '@/components/layout/Layout';
import { 
  Zap, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance?: string;
  usdValue?: string;
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

  // Redirect to unlock page if wallet is locked
  useEffect(() => {
    if (!isUnlocked) {
      router.push('/unlock');
    }
  }, [isUnlocked, router]);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = () => {
    const storedTokens = localStorage.getItem('mpc-wallet-tokens');
    if (storedTokens) {
      setTokens(JSON.parse(storedTokens));
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
        const newToken: Token = {
          address: newTokenAddress,
          symbol: metadata.symbol,
          name: metadata.name,
          decimals: metadata.decimals
        };
        
        const updatedTokens = [...tokens, newToken];
        setTokens(updatedTokens);
        localStorage.setItem('mpc-wallet-tokens', JSON.stringify(updatedTokens));
        setNewTokenAddress('');
        setSuccess(`Successfully added ${metadata.symbol} (${metadata.name})`);
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
    localStorage.setItem('mpc-wallet-tokens', JSON.stringify(updatedTokens));
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
      <Layout title="Import Tokens" subtitle="Add custom ERC-20 tokens to your wallet">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting to unlock page...</h1>
          <p className="text-gray-600">
            Please wait while we redirect you to unlock your wallet.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Import Tokens" subtitle="Add custom ERC-20 tokens to your wallet">
      <div className="space-y-8 animate-fade-in-up">
        {/* Add Token Form */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-scale-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add Custom Token</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Contract Address
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTokenAddress}
                  onChange={(e) => setNewTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddToken}
                  disabled={!newTokenAddress.trim() || isAddingToken}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isAddingToken ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {isAddingToken ? 'Adding...' : 'Add Token'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-800">Success</h3>
                    <p className="text-sm text-green-700 mt-1">{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">How to find token addresses</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    You can find token contract addresses on block explorers like{' '}
                    <a
                      href={currentNetwork?.blockExplorer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      {currentNetwork?.blockExplorer}
                    </a>
                    {' '}or token listing websites.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Token List */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-scale-in delay-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">Your Tokens</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tokens..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={loadTokens}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                title="Refresh tokens"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {filteredTokens.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tokens Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'No tokens match your search.' : 'You haven\'t added any custom tokens yet.'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-gray-500">
                  Add a token contract address above to get started.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTokens.map((token, index) => (
                <motion.div
                  key={token.address}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{token.symbol}</h3>
                        <p className="text-sm text-gray-600">{token.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-mono text-gray-600">
                        {token.address.slice(0, 6)}...{token.address.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500">{token.decimals} decimals</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(token.address, token.address)}
                        className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                        title="Copy contract address"
                      >
                        {copied === token.address ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                      
                      {currentNetwork?.blockExplorer && (
                        <a
                          href={`${currentNetwork.blockExplorer}/token/${token.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                          title="View on explorer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      
                      <button
                        onClick={() => handleRemoveToken(token.address)}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                        title="Remove token"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Popular Tokens */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-scale-in delay-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Star className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">Popular Tokens</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86a33E6441b8c4C8C0e4b8b8b8b8b8b8b8b8b' },
              { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
              { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
            ].map((token, index) => (
              <motion.div
                key={token.symbol}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                onClick={() => setNewTokenAddress(token.address)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {token.symbol.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{token.symbol}</h3>
                    <p className="text-sm text-gray-600">{token.name}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
