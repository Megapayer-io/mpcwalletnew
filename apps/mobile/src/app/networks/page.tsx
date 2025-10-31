'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { Network } from '@evm-wallet/sdk';

// Beautiful SVG Graphics for Networks Page
const NetworkIcon = () => (
  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <filter id="glowNetwork">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Circle */}
    <circle cx="70" cy="70" r="65" fill="rgba(34, 225, 255, 0.08)" />
    
    {/* Network Nodes */}
    <motion.g
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Central Node */}
      <circle cx="70" cy="70" r="18" fill="none" stroke="url(#networkGradient)" strokeWidth="3" filter="url(#glowNetwork)" />
      <circle cx="70" cy="70" r="12" fill="rgba(34, 225, 255, 0.2)" />
      
      {/* Surrounding Nodes */}
      {[
        { x: 70, y: 30 }, // Top
        { x: 110, y: 50 }, // Top Right
        { x: 110, y: 90 }, // Bottom Right
        { x: 70, y: 110 }, // Bottom
        { x: 30, y: 90 }, // Bottom Left
        { x: 30, y: 50 }, // Top Left
      ].map((node, i) => (
        <g key={i}>
          {/* Connection Line */}
          <motion.line
            x1="70"
            y1="70"
            x2={node.x}
            y2={node.y}
            stroke="url(#networkGradient)"
            strokeWidth="2"
            strokeOpacity="0.3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
          />
          {/* Node */}
          <motion.circle
            cx={node.x}
            cy={node.y}
            r="10"
            fill="none"
            stroke="url(#networkGradient)"
            strokeWidth="2.5"
            filter="url(#glowNetwork)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
          />
          <circle cx={node.x} cy={node.y} r="6" fill="rgba(34, 225, 255, 0.3)" />
        </g>
      ))}
    </motion.g>
  </svg>
);

export default function NetworksPage() {
  const router = useRouter();
  const { networks, selectNetwork, currentNetwork, isInitialized, isUnlocked } = useWalletStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [formData, setFormData] = useState({
    chainId: '',
    name: '',
    rpcUrl: '',
    symbol: '',
    blockExplorer: ''
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isInitialized && !isUnlocked) {
      router.push('/unlock');
    }
  }, [isInitialized, isUnlocked, router]);

  const handleSelectNetwork = (chainId: number) => {
    selectNetwork(chainId);
    setSuccess('Network switched successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setValidationError('');
    setError('');
  };

  const validateRpcUrl = async (url: string) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1
        })
      });

      if (!response.ok) {
        throw new Error('RPC URL is not accessible');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error('RPC returned an error');
      }

      const chainId = parseInt(data.result, 16);
      return chainId;
    } catch (error) {
      throw new Error('Invalid or inaccessible RPC URL');
    }
  };

  const handleEditNetwork = (network: Network) => {
    setEditingNetwork(network);
    setFormData({
      chainId: network.chainId.toString(),
      name: network.name,
      rpcUrl: network.rpcUrl,
      symbol: network.symbol,
      blockExplorer: network.blockExplorer || ''
    });
    setShowAddForm(false);
    setValidationError('');
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingNetwork(null);
    setFormData({
      chainId: '',
      name: '',
      rpcUrl: '',
      symbol: '',
      blockExplorer: ''
    });
    setValidationError('');
    setError('');
  };

  const handleUpdateNetwork = async () => {
    if (!editingNetwork) return;

    setIsValidating(true);
    setValidationError('');
    setError('');
    setSuccess('');

    try {
      const chainId = parseInt(formData.chainId);
      if (isNaN(chainId) || chainId <= 0) {
        throw new Error('Chain ID must be a positive number');
      }

      const actualChainId = await validateRpcUrl(formData.rpcUrl);
      if (actualChainId !== chainId) {
        throw new Error(`Chain ID mismatch. Expected ${chainId}, but RPC returned ${actualChainId}`);
      }

      // Get wallet instance and update network
      const { wallet } = useWalletStore.getState();
      if (!wallet) throw new Error('Wallet not initialized');

      // Remove old network and add updated one
      const currentNetworks = wallet.listNetworks();
      const updatedNetworks = currentNetworks.filter(n => n.chainId !== editingNetwork.chainId);
      
      // Add the updated network
      updatedNetworks.push({
        chainId,
        name: formData.name,
        rpcUrl: formData.rpcUrl,
        symbol: formData.symbol,
        blockExplorer: formData.blockExplorer || undefined
      });

      // Save to localStorage
      localStorage.setItem('evm-wallet-networks', JSON.stringify(updatedNetworks));
      
      // Reload networks in wallet
      wallet.loadState();

      // Update store
      useWalletStore.setState({ networks: wallet.listNetworks() });

      // If this was the current network, update it
      if (currentNetwork?.chainId === editingNetwork.chainId) {
        selectNetwork(chainId);
      }

      handleCancelEdit();
      setSuccess('Network updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNetwork) {
      await handleUpdateNetwork();
      return;
    }

    setIsValidating(true);
    setValidationError('');
    setError('');
    setSuccess('');

    try {
      const chainId = parseInt(formData.chainId);
      if (isNaN(chainId) || chainId <= 0) {
        throw new Error('Chain ID must be a positive number');
      }

      const actualChainId = await validateRpcUrl(formData.rpcUrl);
      if (actualChainId !== chainId) {
        throw new Error(`Chain ID mismatch. Expected ${chainId}, but RPC returned ${actualChainId}`);
      }

      const { addNetwork } = useWalletStore.getState();
      addNetwork({
        chainId,
        name: formData.name,
        rpcUrl: formData.rpcUrl,
        symbol: formData.symbol,
        blockExplorer: formData.blockExplorer || undefined
      });

      setFormData({
        chainId: '',
        name: '',
        rpcUrl: '',
        symbol: '',
        blockExplorer: ''
      });
      setShowAddForm(false);
      setSuccess('Network added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  // Get network logo URL based on chain ID
  const getNetworkLogo = (chainId: number): string | null => {
    const logos: Record<number, string> = {
      1: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', // Ethereum
      56: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png', // BSC
      137: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png', // Polygon
    };
    return logos[chainId] || null;
  };

  // Filter out Sepolia testnet (chainId: 11155111)
  const filteredNetworks = networks.filter(network => network.chainId !== 11155111);

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
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#34D39915] flex-shrink-0">
            <NetworkIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-heading text-megapayer-text">Networks</h1>
            <p className="text-sm font-body text-megapayer-muted mt-0.5">
              {filteredNetworks.length} {filteredNetworks.length === 1 ? 'network' : 'networks'} configured
            </p>
          </div>
        </motion.div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="px-5 pb-3 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 megapayer-panel-soft border border-megapayer-emerald/30 rounded-xl"
          >
            <CustomIcons.CheckCircle className="h-4 w-4 text-megapayer-emerald flex-shrink-0" />
            <p className="text-xs font-body text-megapayer-emerald">{success}</p>
          </motion.div>
        </div>
      )}

      {/* Add Network Section */}
      <div className="px-5 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="megapayer-panel rounded-2xl border border-megapayer-border overflow-hidden"
        >
          <button
            onClick={() => {
              if (editingNetwork) {
                handleCancelEdit();
              } else {
                setShowAddForm(!showAddForm);
              }
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-megapayer-panel-soft transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#34D39915] flex-shrink-0">
                <CustomIcons.Plus className="w-4 h-4 text-[#34D399]" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-sm font-semibold font-heading text-megapayer-text">
                  {editingNetwork ? 'Edit Network' : 'Add Custom Network'}
                </h3>
                <p className="text-xs font-body text-megapayer-muted mt-0.5">
                  {editingNetwork ? 'Update network configuration' : 'Configure a new blockchain network'}
                </p>
              </div>
            </div>
            <CustomIcons.ChevronRight className={`w-4 h-4 text-megapayer-muted flex-shrink-0 transition-transform ${showAddForm || editingNetwork ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {(showAddForm || editingNetwork) && (
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
                      Chain ID * {editingNetwork && <span className="text-megapayer-muted font-normal">(cannot be changed)</span>}
                    </label>
                    <input
                      type="number"
                      name="chainId"
                      value={formData.chainId}
                      onChange={handleInputChange}
                      placeholder="e.g., 1"
                      disabled={!!editingNetwork}
                      className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal text-megapayer-text placeholder-megapayer-muted font-body disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold font-heading text-megapayer-text mb-2">
                      Network Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Ethereum Mainnet"
                      className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal text-megapayer-text placeholder-megapayer-muted font-body"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold font-heading text-megapayer-text mb-2">
                      RPC URL *
                    </label>
                    <input
                      type="url"
                      name="rpcUrl"
                      value={formData.rpcUrl}
                      onChange={handleInputChange}
                      placeholder="https://eth.llamarpc.com"
                      className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal text-megapayer-text placeholder-megapayer-muted font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold font-heading text-megapayer-text mb-2">
                      Currency Symbol *
                    </label>
                    <input
                      type="text"
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleInputChange}
                      placeholder="e.g., ETH"
                      className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal text-megapayer-text placeholder-megapayer-muted font-body"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold font-heading text-megapayer-text mb-2">
                      Block Explorer URL (optional)
                    </label>
                    <input
                      type="url"
                      name="blockExplorer"
                      value={formData.blockExplorer}
                      onChange={handleInputChange}
                      placeholder="https://etherscan.io"
                      className="w-full px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal text-megapayer-text placeholder-megapayer-muted font-mono text-sm"
                    />
                  </div>

                  {/* Error Message */}
                  {(error || validationError) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 megapayer-panel-soft border border-red-400/30 rounded-xl"
                    >
                      <CustomIcons.AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <p className="text-xs font-body text-red-500">{error || validationError}</p>
                    </motion.div>
                  )}

                  <motion.button
                    onClick={handleSubmit}
                    disabled={isValidating || !formData.chainId || !formData.name || !formData.rpcUrl || !formData.symbol}
                    whileHover={{ scale: isValidating || !formData.chainId ? 1 : 1.02 }}
                    whileTap={{ scale: isValidating || !formData.chainId ? 1 : 0.98 }}
                    className="w-full megapayer-btn-primary py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold font-heading flex items-center justify-center gap-2"
                  >
                    {isValidating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Validating...
                      </>
                    ) : (
                      <>
                        {editingNetwork ? (
                          <>
                            <CustomIcons.CheckCircle className="w-4 h-4" />
                            Update Network
                          </>
                        ) : (
                          <>
                            <CustomIcons.Plus className="w-4 h-4" />
                            Add Network
                          </>
                        )}
                      </>
                    )}
                  </motion.button>
                  {editingNetwork && (
                    <motion.button
                      onClick={handleCancelEdit}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full megapayer-panel-soft border border-megapayer-border py-3 rounded-xl font-semibold font-heading text-megapayer-text mt-2"
                    >
                      Cancel
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Networks List */}
      <div className="px-5 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="megapayer-panel rounded-2xl border border-megapayer-border overflow-hidden"
        >
          <div className="px-4 py-3.5 flex items-center gap-3 border-b border-megapayer-border">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#7C3AED20]">
              <CustomIcons.Globe className="w-3.5 h-3.5 text-[#7C3AED]" />
            </div>
            <h2 className="text-sm font-semibold font-heading text-megapayer-text">Available Networks</h2>
          </div>

          {filteredNetworks.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-megapayer-panel-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CustomIcons.Globe className="w-8 h-8 text-megapayer-muted" />
              </div>
              <h3 className="text-base font-bold font-heading text-megapayer-text mb-2">No networks configured</h3>
              <p className="text-sm font-body text-megapayer-muted">Add a custom network to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-megapayer-border">
              {filteredNetworks.map((network, index) => {
                const isActive = currentNetwork?.chainId === network.chainId;
                const networkLogo = getNetworkLogo(network.chainId);
                return (
                  <motion.div
                    key={network.chainId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-megapayer-panel-soft transition-colors ${
                      isActive ? 'bg-megapayer-panel-soft' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Network Logo/Status Indicator */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative ${
                        isActive 
                          ? 'bg-[#34D399]' 
                          : networkLogo
                            ? 'bg-megapayer-panel-soft'
                            : 'bg-megapayer-panel-soft'
                      }`}>
                        {networkLogo ? (
                          <>
                            <img 
                              src={networkLogo} 
                              alt={`${network.name} logo`}
                              className="w-full h-full object-cover"
                            />
                            {isActive && (
                              <div className="absolute inset-0 bg-[#34D399] opacity-60 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-white"></div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className={`w-4 h-4 rounded-full ${
                            isActive ? 'bg-white' : 'bg-megapayer-muted'
                          }`}></div>
                        )}
                      </div>

                      {/* Network Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold font-heading text-megapayer-text truncate">
                            {network.name}
                          </h3>
                          {isActive && (
                            <span className="px-2 py-0.5 bg-[#34D39920] text-[#34D399] rounded-full text-xs font-semibold">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-body text-megapayer-muted">
                          Chain ID: {network.chainId} • {network.symbol}
                        </p>
                        {network.rpcUrl && (
                          <p className="text-xs font-mono font-body text-megapayer-muted truncate mt-1">
                            {network.rpcUrl.length > 40 ? `${network.rpcUrl.slice(0, 40)}...` : network.rpcUrl}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <motion.button
                          onClick={() => handleEditNetwork(network)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-megapayer-panel rounded-lg transition-colors"
                          title="Edit network"
                        >
                          <CustomIcons.Settings className="w-4 h-4 text-megapayer-muted" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleSelectNetwork(network.chainId)}
                          disabled={isActive}
                          whileHover={{ scale: isActive ? 1 : 1.05 }}
                          whileTap={{ scale: isActive ? 1 : 0.95 }}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold font-heading transition-all ${
                            isActive
                              ? 'bg-megapayer-panel text-megapayer-muted cursor-not-allowed'
                              : 'megapayer-btn-primary'
                          }`}
                        >
                          {isActive ? 'Selected' : 'Switch'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
