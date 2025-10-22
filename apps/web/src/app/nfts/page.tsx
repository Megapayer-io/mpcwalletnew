'use client';

import { useEffect, useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Layout } from '@/components/layout/Layout';
import { RefreshCw, Image as ImageIcon, ExternalLink, Send, Eye } from 'lucide-react';

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
      <Layout title="NFT Collection" subtitle="Manage and view your NFT collection">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-red-800 font-medium">Error loading NFTs</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Dismiss
              </button>
            </div>
            <p className="text-red-700 text-sm mt-2">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="NFT Collection" subtitle="Manage and view your NFT collection">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your NFTs</h2>
            <p className="text-gray-600 mt-1">
              {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} found on {currentNetwork?.name || 'Unknown Network'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoadingNfts}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingNfts ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoadingNfts && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your NFT collection...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingNfts && nfts.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No NFTs Found</h3>
              <p className="text-gray-600 mb-4">
                You don't have any NFTs in your wallet yet.
              </p>
              <p className="text-sm text-gray-500">
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
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* NFT Image */}
                <div className="aspect-square bg-gray-100 relative">
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
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(nft)}
                        className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTransfer(nft)}
                        className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Transfer NFT"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* NFT Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {nft.name || `NFT #${nft.tokenId}`}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 truncate">
                    {nft.collectionName || 'Unknown Collection'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Token ID: {nft.tokenId}</span>
                    <span className="capitalize">{nft.tokenType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transfer Modal Placeholder */}
        {showTransferModal && selectedNft && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer NFT</h3>
              <p className="text-gray-600 mb-4">
                Transfer functionality will be implemented in a future update.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NFT Details Modal */}
        {showNftDetails && selectedNft && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">NFT Details</h3>
                  <button
                    onClick={() => setShowNftDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image */}
                  <div>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
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
                          <ImageIcon className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedNft.name || `NFT #${selectedNft.tokenId}`}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
                      <p className="text-gray-900">{selectedNft.collectionName || 'Unknown Collection'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Token ID</label>
                      <p className="text-gray-900">{selectedNft.tokenId}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <p className="text-gray-900 capitalize">{selectedNft.tokenType}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contract Address</label>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                        {selectedNft.contractAddress}
                      </p>
                    </div>
                    
                    {selectedNft.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p className="text-gray-900">{selectedNft.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => handleTransfer(selectedNft)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Transfer</span>
                  </button>
                  
                  {currentNetwork?.blockExplorer && (
                    <button
                      onClick={() => {
                        const url = `${currentNetwork.blockExplorer}/token/${selectedNft.contractAddress}?a=${selectedNft.tokenId}`;
                        window.open(url, '_blank');
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View on Explorer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}