'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Header } from '@/components/Header';
import { SendForm } from '@/components/SendForm';
import { Send, Coins, AlertCircle } from 'lucide-react';

export default function SendPage() {
  const [activeTab, setActiveTab] = useState<'eth' | 'token'>('eth');
  const { isUnlocked, currentNetwork } = useWalletStore();

  if (!isUnlocked) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Wallet Locked</h1>
            <p className="text-gray-600">
              Please unlock your wallet to send transactions.
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Transaction</h1>
          <p className="text-gray-600">Send native tokens or ERC-20 tokens</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('eth')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'eth'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Send {currentNetwork?.symbol || 'ETH'}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('token')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'token'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4" />
                  <span>Send Token</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {activeTab === 'eth' ? (
            <SendForm type="eth" />
          ) : (
            <SendForm type="token" />
          )}
        </div>

        {/* Transaction Information */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Transaction Information</h3>
          <div className="text-yellow-800 text-sm space-y-2">
            <p>
              <strong>Current Network:</strong> {currentNetwork?.name} (Chain ID: {currentNetwork?.chainId})
            </p>
            <p>
              <strong>Gas Fees:</strong> Gas fees are automatically estimated and included in your transaction.
            </p>
            <p>
              <strong>Security:</strong> Always verify the recipient address and amount before sending.
              Transactions cannot be reversed once confirmed on the blockchain.
            </p>
            {currentNetwork?.blockExplorer && (
              <p>
                <strong>Explorer:</strong> View your transactions on{' '}
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
