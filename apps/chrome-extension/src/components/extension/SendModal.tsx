'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Send, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SendModal({ isOpen, onClose }: SendModalProps) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'processing'>('form');
  
  const { sendTransaction, address, balance } = useWalletStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!to.trim()) {
      setError('Recipient address is required');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
      setError('Invalid Ethereum address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      setError('Insufficient balance');
      return;
    }

    setError('');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!address) return;

    setIsLoading(true);
    setStep('processing');

    try {
      const txHash = await sendTransaction(to, amount);
      console.log('Transaction sent:', txHash);
      
      // Reset form
      setTo('');
      setAmount('');
      setStep('form');
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Transaction failed');
      setStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openExplorer = () => {
    if (to && to.startsWith('0x')) {
      const explorerUrl = `https://etherscan.io/address/${to}`;
      chrome.tabs.create({ url: explorerUrl });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Send className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Send Transaction</h2>
              <p className="text-sm text-gray-600">Transfer ETH to another address</p>
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
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Address
                </label>
                <div className="relative">
                  <input
                    id="to"
                    type="text"
                    value={to}
                    onChange={(e) => {
                      setTo(e.target.value);
                      setError('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                    placeholder="0x..."
                    required
                  />
                  {to && to.startsWith('0x') && (
                    <button
                      type="button"
                      onClick={openExplorer}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (ETH)
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.0001"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Balance: {parseFloat(balance).toFixed(4)} ETH
                </p>
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!to || !amount}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Transaction</h3>
                <p className="text-gray-600 text-sm">Review the details before sending</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">{formatAddress(to)}</span>
                    <button
                      onClick={openExplorer}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">{amount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network Fee:</span>
                  <span className="font-mono text-sm">~0.001 ETH</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Send Transaction</span>
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Transaction</h3>
              <p className="text-gray-600 text-sm">Please wait while we process your transaction...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
