'use client';

import { useEffect, useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';

export default function NftsPage() {
  const { 
    nfts, 
    isLoadingNfts, 
    error, 
    fetchNfts, 
    clearError,
    address,
    currentNetwork
  } = useWalletStore();
  
  const [selectedNft, setSelectedNft] = useState<any>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showNftDetails, setShowNftDetails] = useState(false);

  useEffect(() => {
    if (address) {
      fetchNfts(address);
    }
  }, [address, fetchNfts]);

  const handleRefresh = () => {
    if (address) {
      fetchNfts(address);
    }
  };

  const handleTransfer = (nft: any) => {
    setSelectedNft(nft);
    setShowTransferModal(true);
  };

  const handleViewDetails = (nft: any) => {
    setSelectedNft(nft);
    setShowNftDetails(true);
  };

  if (error) {
    return (
        <div>
          <div className="megapayer-panel p-3 border border-red-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-red-500 font-semibold text-sm">Error loading NFTs</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
            <p className="text-red-400 text-xs mt-1">{error}</p>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-2">
        {/* Header Section - Compact */}
        <div className="megapayer-panel p-2 text-megapayer-text relative overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-megapayer-accent/10 via-megapayer-violet/10 to-megapayer-emerald/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-megapayer-accent to-megapayer-emerald rounded-lg flex items-center justify-center shadow-md">
                  <CustomIcons.Image className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold mb-0.5 font-heading text-megapayer-text">NFT Collection</h1>
                  <p className="text-megapayer-muted text-xs">
                    {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} found on {currentNetwork?.name || 'Unknown Network'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoadingNfts}
                className="flex items-center gap-1 px-2.5 py-1 megapayer-btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 text-xs"
              >
                <CustomIcons.Refresh className={`w-2.5 h-2.5 ${isLoadingNfts ? 'animate-spin' : ''}`} />
                <span className="font-semibold text-xs">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingNfts && (
          <div className="megapayer-panel p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                {/* Outer glow ring */}
                <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-megapayer-accent/20 via-megapayer-violet/20 to-megapayer-emerald/20 animate-pulse"></div>
                
                {/* Animated gradient circle */}
                <div className="relative w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-megapayer-accent via-megapayer-violet to-megapayer-emerald p-0.5 animate-spin" style={{ animationDuration: '2s' }}>
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <CustomIcons.Image className="w-6 h-6 text-megapayer-accent" />
                  </div>
                </div>
                
                {/* Inner pulsing dot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-megapayer-accent rounded-full animate-ping"></div>
              </div>
              
              {/* Loading text with shimmer */}
              <div className="relative">
                <p className="text-xs text-megapayer-muted font-medium relative z-10">Loading your NFT collection...</p>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-megapayer-accent/10 to-transparent animate-pulse"></div>
              </div>
              
              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                <div className="w-1.5 h-1.5 bg-megapayer-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-1.5 h-1.5 bg-megapayer-violet rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-megapayer-emerald rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingNfts && nfts.length === 0 && (
          <div className="megapayer-panel p-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-lg flex items-center justify-center mx-auto mb-3">
                <CustomIcons.Image className="w-7 h-7 text-megapayer-muted" />
              </div>
              <h3 className="text-sm font-bold text-megapayer-text mb-2 font-heading">No NFTs Found</h3>
              <p className="text-xs text-megapayer-muted mb-3">
                You don't have any NFTs in your wallet yet.
              </p>
              <p className="text-xs text-megapayer-muted">
                NFTs will appear here once you receive them or mint them.
              </p>
            </div>
          </div>
        )}

        {/* NFT Grid */}
        {!isLoadingNfts && nfts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {nfts.map((nft, index) => (
              <div
                key={`${nft.contractAddress}-${nft.tokenId}-${index}`}
                className="megapayer-panel overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group rounded-lg"
              >
                {/* NFT Image */}
                <div className="aspect-square bg-megapayer-panel-soft relative">
                  {nft.image ? (
                    <img
                      src={nft.image}
                      alt={nft.name || `NFT #${nft.tokenId}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-nft.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CustomIcons.Image className="w-8 h-8 text-megapayer-muted" />
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(nft)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-megapayer-text hover:bg-white hover:scale-110 transition-all duration-300 shadow-md"
                        title="View Details"
                      >
                        <CustomIcons.Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTransfer(nft)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-megapayer-text hover:bg-white hover:scale-110 transition-all duration-300 shadow-md"
                        title="Transfer NFT"
                      >
                        <CustomIcons.Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* NFT Info */}
                <div className="p-3">
                  <h3 className="font-bold text-megapayer-text mb-1 truncate text-sm">
                    {nft.name || `NFT #${nft.tokenId}`}
                  </h3>
                  <p className="text-xs text-megapayer-muted mb-2 truncate">
                    {nft.collectionName || 'Unknown Collection'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-megapayer-muted">
                    <span className="font-medium">Token ID: {nft.tokenId}</span>
                    <span className="capitalize font-medium bg-megapayer-panel-soft px-1.5 py-0.5 rounded">{nft.tokenType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transfer Modal Placeholder */}
        {showTransferModal && selectedNft && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="megapayer-panel max-w-sm w-full p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-megapayer-accent to-megapayer-emerald rounded-lg flex items-center justify-center shadow-md">
                  <CustomIcons.Send className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-megapayer-text font-heading">Transfer NFT</h3>
              </div>
              <p className="text-xs text-megapayer-muted mb-3">
                Transfer functionality will be implemented in a future update.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="px-3 py-1.5 megapayer-btn rounded-lg hover:scale-105 transition-all duration-300 text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NFT Details Modal */}
        {showNftDetails && selectedNft && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="megapayer-panel max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-3 border-b border-megapayer-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-megapayer-accent to-megapayer-emerald rounded-lg flex items-center justify-center shadow-md">
                      <CustomIcons.Image className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-megapayer-text font-heading">NFT Details</h3>
                  </div>
                  <button
                    onClick={() => setShowNftDetails(false)}
                    className="p-1.5 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-all duration-300 hover:scale-110"
                  >
                    <CustomIcons.X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Image */}
                  <div>
                    <div className="aspect-square bg-megapayer-panel-soft rounded-lg overflow-hidden">
                      {selectedNft.image ? (
                        <img
                          src={selectedNft.image}
                          alt={selectedNft.name || `NFT #${selectedNft.tokenId}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-nft.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <CustomIcons.Image className="w-10 h-10 text-megapayer-muted" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-2">
                    <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                      <label className="block text-xs font-semibold text-megapayer-text mb-1">Name</label>
                      <p className="text-sm font-bold text-megapayer-text">
                        {selectedNft.name || `NFT #${selectedNft.tokenId}`}
                      </p>
                    </div>
                    
                    <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                      <label className="block text-xs font-semibold text-megapayer-text mb-1">Collection</label>
                      <p className="text-xs text-megapayer-text">{selectedNft.collectionName || 'Unknown Collection'}</p>
                    </div>
                    
                    <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                      <label className="block text-xs font-semibold text-megapayer-text mb-1">Token ID</label>
                      <p className="text-xs text-megapayer-text font-mono">{selectedNft.tokenId}</p>
                    </div>
                    
                    <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                      <label className="block text-xs font-semibold text-megapayer-text mb-1">Type</label>
                      <p className="text-xs text-megapayer-text capitalize">{selectedNft.tokenType}</p>
                    </div>
                    
                    <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                      <label className="block text-xs font-semibold text-megapayer-text mb-1">Contract Address</label>
                      <p className="text-[10px] font-mono text-megapayer-muted break-all">
                        {selectedNft.contractAddress}
                      </p>
                    </div>
                    
                    {selectedNft.description && (
                      <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                        <label className="block text-xs font-semibold text-megapayer-text mb-1">Description</label>
                        <p className="text-xs text-megapayer-text">{selectedNft.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleTransfer(selectedNft)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 megapayer-btn-primary rounded-lg hover:scale-105 transition-all duration-300 text-xs"
                  >
                    <CustomIcons.Send className="w-3.5 h-3.5" />
                    <span className="font-semibold">Transfer</span>
                  </button>
                  
                  {currentNetwork?.blockExplorer && (
                    <button
                      onClick={() => {
                        const url = `${currentNetwork.blockExplorer}/token/${selectedNft.contractAddress}?a=${selectedNft.tokenId}`;
                        window.open(url, '_blank');
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 megapayer-btn rounded-lg hover:scale-105 transition-all duration-300 text-xs"
                    >
                      <CustomIcons.ExternalLink className="w-3.5 h-3.5" />
                      <span className="font-semibold">View on Explorer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}