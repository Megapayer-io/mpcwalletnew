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
          <div className="megapayer-panel p-6 border border-red-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-red-500 font-semibold">Error loading NFTs</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
            <p className="text-red-400 text-sm mt-2">{error}</p>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-4">
        {/* Header Section - Compact */}
        <div className="megapayer-panel p-4 text-megapayer-text relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-megapayer-accent/10 via-megapayer-violet/10 to-megapayer-emerald/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-megapayer-accent to-megapayer-emerald rounded-lg flex items-center justify-center shadow-md">
                  <CustomIcons.Image className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold mb-0.5 font-heading text-megapayer-text">NFT Collection</h1>
                  <p className="text-megapayer-muted text-xs">
                    {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} found on {currentNetwork?.name || 'Unknown Network'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoadingNfts}
                className="flex items-center gap-2 px-6 py-3 megapayer-btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
              >
                <CustomIcons.Refresh className={`w-4 h-4 ${isLoadingNfts ? 'animate-spin' : ''}`} />
                <span className="font-semibold">Refresh</span>
              </button>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-megapayer-accent/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-megapayer-emerald/5 rounded-full"></div>
        </div>

        {/* Loading State */}
        {isLoadingNfts && (
          <div className="megapayer-panel p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-megapayer-accent via-megapayer-violet to-megapayer-emerald rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <CustomIcons.Image className="w-10 h-10 text-white" />
              </div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-accent mx-auto mb-4"></div>
              <p className="text-megapayer-muted font-medium">Loading your NFT collection...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingNfts && nfts.length === 0 && (
          <div className="megapayer-panel p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CustomIcons.Image className="w-10 h-10 text-megapayer-muted" />
              </div>
              <h3 className="text-xl font-bold text-megapayer-text mb-3 font-heading">No NFTs Found</h3>
              <p className="text-megapayer-muted mb-6">
                You don't have any NFTs in your wallet yet.
              </p>
              <p className="text-sm text-megapayer-muted">
                NFTs will appear here once you receive them or mint them.
              </p>
            </div>
          </div>
        )}

        {/* NFT Grid */}
        {!isLoadingNfts && nfts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft, index) => (
              <div
                key={`${nft.contractAddress}-${nft.tokenId}-${index}`}
                className="megapayer-panel overflow-hidden hover:shadow-megapayer transition-all duration-300 hover:-translate-y-1 group"
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
                      <CustomIcons.Image className="w-12 h-12 text-megapayer-muted" />
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleViewDetails(nft)}
                        className="p-3 bg-white/90 backdrop-blur-sm rounded-xl text-megapayer-text hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
                        title="View Details"
                      >
                        <CustomIcons.Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleTransfer(nft)}
                        className="p-3 bg-white/90 backdrop-blur-sm rounded-xl text-megapayer-text hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
                        title="Transfer NFT"
                      >
                        <CustomIcons.Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* NFT Info */}
                <div className="p-6">
                  <h3 className="font-bold text-megapayer-text mb-2 truncate text-lg">
                    {nft.name || `NFT #${nft.tokenId}`}
                  </h3>
                  <p className="text-sm text-megapayer-muted mb-3 truncate">
                    {nft.collectionName || 'Unknown Collection'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-megapayer-muted">
                    <span className="font-medium">Token ID: {nft.tokenId}</span>
                    <span className="capitalize font-medium bg-megapayer-panel-soft px-2 py-1 rounded-lg">{nft.tokenType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transfer Modal Placeholder */}
        {showTransferModal && selectedNft && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="megapayer-panel max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-megapayer-accent to-megapayer-emerald rounded-xl flex items-center justify-center shadow-lg">
                  <CustomIcons.Send className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-megapayer-text font-heading">Transfer NFT</h3>
              </div>
              <p className="text-megapayer-muted mb-6">
                Transfer functionality will be implemented in a future update.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="px-6 py-3 megapayer-btn rounded-xl hover:scale-105 transition-all duration-300"
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
            <div className="megapayer-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-megapayer-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-megapayer-accent to-megapayer-emerald rounded-xl flex items-center justify-center shadow-lg">
                      <CustomIcons.Image className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-megapayer-text font-heading">NFT Details</h3>
                  </div>
                  <button
                    onClick={() => setShowNftDetails(false)}
                    className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
                  >
                    <CustomIcons.X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image */}
                  <div>
                    <div className="aspect-square bg-megapayer-panel-soft rounded-xl overflow-hidden">
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
                          <CustomIcons.Image className="w-16 h-16 text-megapayer-muted" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-4">
                    <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                      <label className="block text-sm font-semibold text-megapayer-text mb-2">Name</label>
                      <p className="text-lg font-bold text-megapayer-text">
                        {selectedNft.name || `NFT #${selectedNft.tokenId}`}
                      </p>
                    </div>
                    
                    <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                      <label className="block text-sm font-semibold text-megapayer-text mb-2">Collection</label>
                      <p className="text-megapayer-text">{selectedNft.collectionName || 'Unknown Collection'}</p>
                    </div>
                    
                    <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                      <label className="block text-sm font-semibold text-megapayer-text mb-2">Token ID</label>
                      <p className="text-megapayer-text font-mono">{selectedNft.tokenId}</p>
                    </div>
                    
                    <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                      <label className="block text-sm font-semibold text-megapayer-text mb-2">Type</label>
                      <p className="text-megapayer-text capitalize">{selectedNft.tokenType}</p>
                    </div>
                    
                    <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                      <label className="block text-sm font-semibold text-megapayer-text mb-2">Contract Address</label>
                      <p className="text-sm font-mono text-megapayer-muted break-all">
                        {selectedNft.contractAddress}
                      </p>
                    </div>
                    
                    {selectedNft.description && (
                      <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                        <label className="block text-sm font-semibold text-megapayer-text mb-2">Description</label>
                        <p className="text-megapayer-text">{selectedNft.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={() => handleTransfer(selectedNft)}
                    className="flex items-center space-x-2 px-6 py-3 megapayer-btn-primary rounded-xl hover:scale-105 transition-all duration-300"
                  >
                    <CustomIcons.Send className="w-4 h-4" />
                    <span className="font-semibold">Transfer</span>
                  </button>
                  
                  {currentNetwork?.blockExplorer && (
                    <button
                      onClick={() => {
                        const url = `${currentNetwork.blockExplorer}/token/${selectedNft.contractAddress}?a=${selectedNft.tokenId}`;
                        window.open(url, '_blank');
                      }}
                      className="flex items-center space-x-2 px-6 py-3 megapayer-btn rounded-xl hover:scale-105 transition-all duration-300"
                    >
                      <CustomIcons.ExternalLink className="w-4 h-4" />
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