'use client';

import { useEffect, useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { RefreshCw, Image as ImageIcon, ExternalLink, Send, Eye } from 'lucide-react';
// import NftTransferModal from '@/components/NftTransferModal';

export default function NftsPage() {
  const { 
    nfts, 
    isLoadingNfts, 
    fetchNfts, 
    address, 
    currentNetwork,
    error,
    clearError 
  } = useWalletStore();
  
  const [selectedNft, setSelectedNft] = useState<any>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showNftDetails, setShowNftDetails] = useState(false);

  useEffect(() => {
    if (address && currentNetwork) {
      fetchNfts(address);
    }
  }, [address, currentNetwork, fetchNfts]);

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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
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
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NFTs</h1>
            <p className="text-gray-600 mt-1">
              Manage your NFT collection on {currentNetwork?.name || 'Unknown Network'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoadingNfts}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingNfts ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total NFTs</p>
                <p className="text-2xl font-bold text-gray-900">{nfts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Collections</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(nfts.map(nft => nft.contractAddress)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Send className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ERC1155 Tokens</p>
                <p className="text-2xl font-bold text-gray-900">
                  {nfts.filter(nft => nft.tokenType === 'ERC1155').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingNfts && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading your NFTs...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingNfts && nfts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs found</h3>
            <p className="text-gray-600 mb-6">
              You don't have any NFTs in this wallet on {currentNetwork?.name || 'this network'}.
            </p>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}

        {/* NFT Grid */}
        {!isLoadingNfts && nfts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {nfts.map((nft, index) => (
              <div
                key={`${nft.contractAddress}-${nft.tokenId}`}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
              >
                {/* NFT Image */}
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  {nft.image ? (
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-nft.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(nft)}
                        className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleTransfer(nft)}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                        title="Transfer"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* NFT Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate mb-1">
                    {nft.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate mb-2">
                    {nft.collectionName || 'Unknown Collection'}
                  </p>
                  
                  {/* Token ID and Type */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>#{nft.tokenId}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {nft.tokenType}
                    </span>
                  </div>
                  
                  {/* Balance for ERC1155 */}
                  {nft.tokenType === 'ERC1155' && nft.balance && (
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                      Balance: {nft.balance}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transfer Modal - Coming Soon */}
        {showTransferModal && selectedNft && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Transfer NFT</h3>
              <p className="text-gray-600 mb-4">NFT transfer functionality coming soon...</p>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedNft(null);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* NFT Details Modal */}
        {showNftDetails && selectedNft && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">NFT Details</h2>
                  <button
                    onClick={() => {
                      setShowNftDetails(false);
                      setSelectedNft(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {selectedNft.image ? (
                      <img
                        src={selectedNft.image}
                        alt={selectedNft.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-nft.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedNft.name}
                      </h3>
                      <p className="text-gray-600">
                        {selectedNft.collectionName || 'Unknown Collection'}
                      </p>
                    </div>
                    
                    {selectedNft.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                        <p className="text-gray-600 text-sm">{selectedNft.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Token ID:</span>
                        <p className="font-medium">#{selectedNft.tokenId}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="font-medium">{selectedNft.tokenType}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Contract:</span>
                        <p className="font-mono text-xs break-all">
                          {selectedNft.contractAddress}
                        </p>
                      </div>
                      {selectedNft.balance && (
                        <div>
                          <span className="text-gray-500">Balance:</span>
                          <p className="font-medium">{selectedNft.balance}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Attributes */}
                    {selectedNft.metadata?.attributes && selectedNft.metadata.attributes.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Attributes</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedNft.metadata.attributes.map((attr: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                              <div className="text-gray-500">{attr.trait_type}</div>
                              <div className="font-medium">{attr.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}