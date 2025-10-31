'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { motion, AnimatePresence } from 'framer-motion';

// Beautiful SVG Graphics for NFT Page
const NFTIcon = () => (
  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="nftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <filter id="glowNFT">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Circle */}
    <circle cx="70" cy="70" r="65" fill="rgba(34, 225, 255, 0.08)" />
    
    {/* NFT Frame/Image */}
    <motion.g
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Outer Frame */}
      <rect x="35" y="35" width="70" height="70" rx="8" fill="none" stroke="url(#nftGradient)" strokeWidth="4" filter="url(#glowNFT)" />
      
      {/* Inner Image Area */}
      <rect x="42" y="42" width="56" height="56" rx="4" fill="rgba(34, 225, 255, 0.1)" />
      
      {/* Image Pattern/Grid */}
      <rect x="45" y="45" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.6" />
      <rect x="59" y="45" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.4" />
      <rect x="73" y="45" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.5" />
      <rect x="87" y="45" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.3" />
      
      <rect x="45" y="59" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.5" />
      <rect x="59" y="59" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.7" />
      <rect x="73" y="59" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.4" />
      <rect x="87" y="59" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.6" />
      
      <rect x="45" y="73" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.3" />
      <rect x="59" y="73" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.5" />
      <rect x="73" y="73" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.6" />
      <rect x="87" y="73" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.4" />
      
      <rect x="45" y="87" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.6" />
      <rect x="59" y="87" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.3" />
      <rect x="73" y="87" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.5" />
      <rect x="87" y="87" width="12" height="12" rx="2" fill="url(#nftGradient)" opacity="0.7" />
      
      {/* Verification Badge */}
      <motion.circle
        cx="95"
        cy="50"
        r="10"
        fill="#34D399"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      />
      <path
        d="M90 50 L93 53 L100 46"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </motion.g>
    
    {/* Floating NFT Particles */}
    {[...Array(8)].map((_, i) => {
      const angle = (i * 45) * Math.PI / 180;
      const radius = 60;
      const x = 70 + Math.cos(angle) * radius;
      const y = 70 + Math.sin(angle) * radius;
      return (
        <motion.rect
          key={i}
          x={x - 3}
          y={y - 3}
          width="6"
          height="6"
          rx="1"
          fill="#7C3AED"
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
            rotate: [0, 90, 0]
          }}
          transition={{
            delay: 0.6 + i * 0.1,
            duration: 3,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

export default function NftsPage() {
  const router = useRouter();
  const { 
    nfts, 
    isLoadingNfts, 
    error, 
    fetchNfts, 
    clearError,
    address,
    currentNetwork,
    isInitialized,
    isUnlocked
  } = useWalletStore();
  
  const [selectedNft, setSelectedNft] = useState<any>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showNftDetails, setShowNftDetails] = useState(false);
  const [displayNfts, setDisplayNfts] = useState<any[]>([]);
  const [userFriendlyError, setUserFriendlyError] = useState<string>('');

  // Demo NFT - Always shown for preview
  const demoNft = {
    contractAddress: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
    tokenId: '12345',
    name: 'Digital Art #12345',
    description: 'A unique digital collectible demonstrating the NFT display. This is a demo NFT to showcase the wallet\'s NFT viewing capabilities.',
    image: 'https://picsum.photos/400/400?random=1',
    collectionName: 'Demo Collection',
    collectionSymbol: 'DEMO',
    tokenType: 'ERC721',
    balance: '1',
    metadata: {
      name: 'Digital Art #12345',
      description: 'A unique digital collectible demonstrating the NFT display.',
      image: 'https://picsum.photos/400/400?random=1',
      attributes: [
        { trait_type: 'Rarity', value: 'Common' },
        { trait_type: 'Theme', value: 'Abstract' },
        { trait_type: 'Color', value: 'Vibrant' }
      ]
    }
  };

  // Convert technical errors to user-friendly messages
  useEffect(() => {
    if (error) {
      const errorLower = error.toLowerCase();
      
      // Check for technical error patterns and convert to user-friendly messages
      if (errorLower.includes('transaction') || errorLower.includes('rpc') || errorLower.includes('call') || 
          errorLower.includes('function') || errorLower.includes('viem') || errorLower.includes('evm error') ||
          errorLower.includes('balanceof') || errorLower.includes('0x') && errorLower.includes('args')) {
        setUserFriendlyError('Unable to load NFTs at the moment. Please try again later.');
      } else if (errorLower.includes('unsupported chain') || errorLower.includes('chain id')) {
        setUserFriendlyError('NFTs are not available on this network.');
      } else if (errorLower.includes('network') || errorLower.includes('fetch')) {
        setUserFriendlyError('Network error. Please check your connection and try again.');
      } else if (errorLower.includes('api') || errorLower.includes('rate limit')) {
        setUserFriendlyError('Service temporarily unavailable. Please try again in a moment.');
      } else {
        // For other errors, show a generic friendly message
        setUserFriendlyError('Unable to load NFTs. Please try refreshing.');
      }
    } else {
      setUserFriendlyError('');
    }
  }, [error]);

  useEffect(() => {
    if (isInitialized && !isUnlocked) {
      router.push('/unlock');
    }
  }, [isInitialized, isUnlocked, router]);

  useEffect(() => {
    if (address && isUnlocked) {
      fetchNfts(address).catch(() => {
        // Silently handle errors - error state will be set by store
      });
    }
  }, [address, fetchNfts, isUnlocked]);

  // Update display NFTs when nfts change - always include demo NFT
  useEffect(() => {
    if (nfts.length > 0) {
      // Only add demo if it's not already in the list
      const hasDemo = nfts.some(nft => 
        nft.contractAddress === demoNft.contractAddress && 
        nft.tokenId === demoNft.tokenId
      );
      setDisplayNfts(hasDemo ? nfts : [demoNft, ...nfts]);
    } else if (!isLoadingNfts) {
      // Show demo NFT when no real NFTs or when not loading
      setDisplayNfts([demoNft]);
    } else {
      setDisplayNfts([]);
    }
  }, [nfts, isLoadingNfts]);

  const handleRefresh = () => {
    if (address) {
      clearError();
      setUserFriendlyError('');
      fetchNfts(address).catch(() => {
        // Silently handle errors
      });
    }
  };

  const handleTransfer = (nft: any) => {
    setSelectedNft(nft);
    setShowNftDetails(false);
    setShowTransferModal(true);
  };

  const handleViewDetails = (nft: any) => {
    setSelectedNft(nft);
    setShowTransferModal(false);
    setShowNftDetails(true);
  };

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
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#7C3AED15] flex-shrink-0">
            <NFTIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-heading text-megapayer-text">NFTs</h1>
            <p className="text-sm font-body text-megapayer-muted mt-0.5">
              {isLoadingNfts ? 'Loading...' : `${displayNfts.length} ${displayNfts.length === 1 ? 'NFT' : 'NFTs'} on ${currentNetwork?.name || 'network'}`}
            </p>
          </div>
          <motion.button
            onClick={handleRefresh}
            disabled={isLoadingNfts}
            whileHover={{ scale: isLoadingNfts ? 1 : 1.1 }}
            whileTap={{ scale: isLoadingNfts ? 1 : 0.9 }}
            className="p-2 rounded-xl hover:bg-megapayer-panel-soft transition-colors disabled:opacity-50"
            title="Refresh NFTs"
          >
            <CustomIcons.Refresh className={`w-5 h-5 text-megapayer-text ${isLoadingNfts ? 'animate-spin' : ''}`} />
          </motion.button>
        </motion.div>
      </div>

      {/* User-Friendly Error Message */}
      {userFriendlyError && (
        <div className="px-5 pb-3 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 megapayer-panel-soft border border-yellow-400/30 rounded-xl"
          >
            <CustomIcons.Info className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-body text-yellow-600 mb-1">{userFriendlyError}</p>
              <button
                onClick={() => {
                  clearError();
                  setUserFriendlyError('');
                }}
                className="text-xs font-medium text-yellow-500 hover:text-yellow-600 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Loading State - Beautiful Minimal Animation */}
      {isLoadingNfts && (
        <div className="px-5 pb-4 relative z-10 flex-1 flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* Outer Rotating Gradient Ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #22E1FF, #7C3AED, #34D399, #22E1FF)',
                padding: '4px',
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div className="w-full h-full rounded-full bg-megapayer-bg" />
            </motion.div>
            
            {/* Inner Pulsing Glow */}
            <motion.div
              className="absolute inset-6 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(124,58,237,0.3), rgba(34,225,255,0.2), transparent)',
              }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 0.9, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Center NFT Icon */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <CustomIcons.Image className="w-10 h-10 text-megapayer-teal" />
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingNfts && displayNfts.length === 0 && !userFriendlyError && (
        <div className="px-5 pb-4 relative z-10 flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-megapayer-panel-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CustomIcons.Image className="w-10 h-10 text-megapayer-muted" />
            </div>
            <h3 className="text-base font-bold font-heading text-megapayer-text mb-2">No NFTs Found</h3>
            <p className="text-sm font-body text-megapayer-muted">
              You don't have any NFTs in your wallet yet.
            </p>
            <p className="text-xs font-body text-megapayer-muted mt-1">
              NFTs will appear here once you receive them.
            </p>
          </motion.div>
        </div>
      )}

      {/* NFT Grid */}
      {!isLoadingNfts && displayNfts.length > 0 && (
        <div className="px-5 pb-4 relative z-10">
          <div className="grid grid-cols-2 gap-3">
            {displayNfts.map((nft, index) => (
              <motion.div
                key={`${nft.contractAddress}-${nft.tokenId}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleViewDetails(nft)}
                className="megapayer-panel rounded-xl border border-megapayer-border overflow-hidden cursor-pointer active:scale-95 transition-all"
              >
                {/* NFT Image */}
                <div className="aspect-square bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel relative overflow-hidden">
                  {nft.image ? (
                    <img
                      src={nft.image}
                      alt={nft.name || `NFT #${nft.tokenId}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.nft-fallback') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="nft-fallback w-full h-full flex items-center justify-center absolute inset-0"
                    style={{ display: nft.image ? 'none' : 'flex' }}
                  >
                    <div className="text-center">
                      <CustomIcons.Image className="w-12 h-12 text-megapayer-muted mx-auto mb-2" />
                      <p className="text-xs font-body text-megapayer-muted">No Image</p>
                    </div>
                  </div>
                  
                  {/* Token Type Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold rounded-lg">
                      {nft.tokenType || 'ERC721'}
                    </span>
                  </div>
                </div>

                {/* NFT Info */}
                <div className="p-3">
                  <h3 className="text-sm font-bold font-heading text-megapayer-text truncate mb-1">
                    {nft.name || `NFT #${nft.tokenId}`}
                  </h3>
                  <p className="text-xs font-body text-megapayer-muted truncate">
                    {nft.collectionName || 'Unknown Collection'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* NFT Details Modal - Mobile Friendly Bottom Sheet Style */}
      <AnimatePresence>
        {showNftDetails && selectedNft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowNftDetails(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 megapayer-panel rounded-t-3xl border-t border-megapayer-border overflow-hidden"
              style={{ 
                height: '85vh',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Drag Handle */}
              <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
                <div className="w-12 h-1.5 bg-megapayer-muted/30 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-megapayer-border flex-shrink-0">
                <h3 className="text-lg font-bold font-heading text-megapayer-text">NFT Details</h3>
                <button
                  onClick={() => setShowNftDetails(false)}
                  className="p-2 hover:bg-megapayer-panel-soft rounded-lg transition-colors"
                >
                  <CustomIcons.X className="w-5 h-5 text-megapayer-muted" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
                {/* Image */}
                <div className="aspect-square bg-megapayer-panel-soft rounded-2xl overflow-hidden">
                  {selectedNft.image ? (
                    <img
                      src={selectedNft.image}
                      alt={selectedNft.name || `NFT #${selectedNft.tokenId}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.detail-fallback') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="detail-fallback w-full h-full flex items-center justify-center"
                    style={{ display: selectedNft.image ? 'none' : 'flex' }}
                  >
                    <div className="text-center">
                      <CustomIcons.Image className="w-16 h-16 text-megapayer-muted mx-auto mb-2" />
                      <p className="text-sm font-body text-megapayer-muted">No Image Available</p>
                    </div>
                  </div>
                </div>

                {/* Transfer Button - Below Picture */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => handleTransfer(selectedNft)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 megapayer-btn-primary py-3.5 rounded-xl font-semibold font-heading flex items-center justify-center gap-2"
                  >
                    <CustomIcons.Send className="w-4 h-4" />
                    Transfer
                  </motion.button>
                  
                  {currentNetwork?.blockExplorer && (
                    <motion.button
                      onClick={() => {
                        const url = `${currentNetwork.blockExplorer}/token/${selectedNft.contractAddress}?a=${selectedNft.tokenId}`;
                        window.open(url, '_blank');
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 megapayer-panel-soft border border-megapayer-border py-3.5 rounded-xl font-semibold font-heading text-megapayer-text flex items-center justify-center gap-2"
                    >
                      <CustomIcons.ExternalLink className="w-4 h-4" />
                      Explorer
                    </motion.button>
                  )}
                </div>

                {/* Details Cards */}
                <div className="space-y-3 pb-4">
                  <div className="megapayer-panel-soft p-3 rounded-xl">
                    <label className="block text-xs font-semibold font-heading text-megapayer-text mb-1">Name</label>
                    <p className="text-sm font-body text-megapayer-text">
                      {selectedNft.name || `NFT #${selectedNft.tokenId}`}
                    </p>
                  </div>

                  <div className="megapayer-panel-soft p-3 rounded-xl">
                    <label className="block text-xs font-semibold font-heading text-megapayer-text mb-1">Collection</label>
                    <p className="text-sm font-body text-megapayer-text">
                      {selectedNft.collectionName || 'Unknown Collection'}
                    </p>
                  </div>

                  <div className="megapayer-panel-soft p-3 rounded-xl">
                    <label className="block text-xs font-semibold font-heading text-megapayer-text mb-1">Token ID</label>
                    <p className="text-sm font-mono font-body text-megapayer-text break-all">{selectedNft.tokenId}</p>
                  </div>

                  <div className="megapayer-panel-soft p-3 rounded-xl">
                    <label className="block text-xs font-semibold font-heading text-megapayer-text mb-1">Type</label>
                    <p className="text-sm font-body text-megapayer-text capitalize">{selectedNft.tokenType || 'ERC721'}</p>
                  </div>

                  {selectedNft.description && (
                    <div className="megapayer-panel-soft p-3 rounded-xl">
                      <label className="block text-xs font-semibold font-heading text-megapayer-text mb-1">Description</label>
                      <p className="text-sm font-body text-megapayer-text leading-relaxed">{selectedNft.description}</p>
                    </div>
                  )}

                  <div className="megapayer-panel-soft p-3 rounded-xl">
                    <label className="block text-xs font-semibold font-heading text-megapayer-text mb-1">Contract Address</label>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedNft.contractAddress);
                      }}
                      className="text-xs font-mono font-body text-megapayer-muted break-all text-left hover:text-megapayer-text transition-colors"
                    >
                      {selectedNft.contractAddress}
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransferModal && selectedNft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
            onClick={() => setShowTransferModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="megapayer-panel rounded-2xl border border-megapayer-border w-full max-w-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#22E1FF] to-[#34D399] rounded-xl flex items-center justify-center">
                  <CustomIcons.Send className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold font-heading text-megapayer-text">Transfer NFT</h3>
              </div>
              <p className="text-sm font-body text-megapayer-muted mb-6">
                Transfer functionality will be implemented in a future update.
              </p>
              <motion.button
                onClick={() => setShowTransferModal(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full megapayer-btn-primary py-3 rounded-xl font-semibold font-heading"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
