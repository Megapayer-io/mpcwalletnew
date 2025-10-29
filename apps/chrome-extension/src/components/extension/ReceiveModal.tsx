'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Download, Copy, Check, ExternalLink, QrCode } from 'lucide-react';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
  const { address } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openExplorer = () => {
    if (address && address.startsWith('0x')) {
      const explorerUrl = `https://etherscan.io/address/${address}`;
      chrome.tabs.create({ url: explorerUrl });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Receive</h2>
              <p className="text-sm text-gray-600">Share your address to receive funds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              {showQR ? (
                <div className="w-16 h-16 bg-black rounded flex items-center justify-center">
                  <span className="text-white text-xs">QR Code</span>
                </div>
              ) : (
                <QrCode className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Address
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {address}
                  </p>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How to receive funds:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Share your address with the sender</li>
                <li>2. Make sure they send to the correct network</li>
                <li>3. Wait for the transaction to be confirmed</li>
                <li>4. Your balance will update automatically</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Important:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Only send ETH and ERC-20 tokens to this address</li>
                <li>• Double-check the address before sharing</li>
                <li>• Never share your private key or seed phrase</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCopyAddress}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied ? 'Copied!' : 'Copy Address'}</span>
              </button>
              <button
                onClick={openExplorer}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Explorer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
