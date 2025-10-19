'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Header } from '@/components/Header';
import { ReceiveForm } from '@/components/ReceiveForm';
import { AlertCircle, Download, Share2, Copy, QrCode } from 'lucide-react';

export default function ReceivePage() {
  const { isUnlocked, address, currentNetwork } = useWalletStore();

  if (!isUnlocked) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Wallet Locked</h1>
            <p className="text-gray-600">
              Please unlock your wallet to view your receive address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Receive Funds</h1>
          <p className="text-gray-600">Share your wallet address to receive payments</p>
        </div>

        {/* Network Information */}
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Network</h3>
              <p className="text-green-700 font-medium">
                {currentNetwork?.name} (Chain ID: {currentNetwork?.chainId})
              </p>
              <p className="text-sm text-gray-600">
                Make sure the sender is using the same network
              </p>
            </div>
          </div>
        </div>

        {/* Receive Form */}
        <ReceiveForm />

        {/* Important Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Information</h3>
          <div className="text-blue-800 text-sm space-y-2">
            <p>
              <strong>Network Compatibility:</strong> Only send tokens that are compatible with {currentNetwork?.name}.
              Sending tokens from other networks may result in permanent loss.
            </p>
            <p>
              <strong>Address Verification:</strong> Always verify the recipient address before sending.
              This address is unique to your wallet on {currentNetwork?.name}.
            </p>
            <p>
              <strong>Transaction Time:</strong> Transactions typically take a few minutes to confirm,
              depending on network congestion.
            </p>
            <p>
              <strong>QR Code:</strong> The QR code contains your wallet address and can be scanned by other wallets
              to send you funds directly.
            </p>
            {currentNetwork?.blockExplorer && (
              <p>
                <strong>Block Explorer:</strong> Track incoming transactions on{' '}
                <a
                  href={currentNetwork.blockExplorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  {currentNetwork.blockExplorer}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
