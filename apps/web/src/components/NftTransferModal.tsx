'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface NFT {
  tokenId: string;
  name: string;
  description?: string;
  image?: string;
  contractAddress: string;
  collectionName?: string;
}

interface NftTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (to: string, tokenId: string) => void;
  nft: NFT;
  isLoading?: boolean;
}

export default function NftTransferModal({
  isOpen,
  onClose,
  onConfirm,
  nft,
  isLoading = false
}: NftTransferModalProps) {
  const [to, setTo] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const { address } = useWalletStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!to.trim()) {
      setError('Recipient address is required');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
      setError('Invalid Ethereum address');
      return;
    }

    if (to.toLowerCase() === address?.toLowerCase()) {
      setError('Cannot send NFT to yourself');
      return;
    }

    setError('');
    onConfirm(to, nft.tokenId);
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(nft.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🖼️</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Transfer NFT</h2>
              <p className="text-sm text-gray-600">Send your NFT to another address</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* NFT Details */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              {nft.image ? (
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🖼️</span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{nft.name}</h3>
                {nft.collectionName && (
                  <p className="text-sm text-gray-600">{nft.collectionName}</p>
                )}
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500 font-mono">
                    {formatAddress(nft.contractAddress)}
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className="text-gray-400 hover:text-gray-600"
                    title="Copy contract address"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                  <button
                    onClick={() => window.open(`https://etherscan.io/address/${nft.contractAddress}`, '_blank')}
                    className="text-gray-400 hover:text-gray-600"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
            
            {nft.description && (
              <p className="text-sm text-gray-600">{nft.description}</p>
            )}
          </div>

          {/* Transfer Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                id="to"
                type="text"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                placeholder="0x..."
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the Ethereum address to receive this NFT
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Security Notice</h4>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                This transfer is irreversible. Make sure the recipient address is correct before proceeding.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !to.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Transferring...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Transfer NFT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
