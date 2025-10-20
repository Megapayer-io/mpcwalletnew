'use client';

import React, { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Clock, Filter, RefreshCw } from 'lucide-react';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
  status: 'success' | 'pending' | 'failed';
  type: 'send' | 'receive' | 'contract';
  tokenSymbol?: string;
  tokenName?: string;
  tokenAddress?: string;
}

export default function HistoryPage() {
  const { 
    address, 
    currentNetwork, 
    transactions, 
    isLoadingTransactions, 
    error, 
    fetchTransactions
  } = useWalletStore();
  
  const [filter, setFilter] = useState<'all' | 'send' | 'receive' | 'contract'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (address && currentNetwork && !hasLoadedOnce) {
      loadTransactions();
      setHasLoadedOnce(true);
    }
  }, [address, currentNetwork, hasLoadedOnce]);

  const loadTransactions = async () => {
    if (!address || !currentNetwork) return;
    try {
      await fetchTransactions();
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    
    // For very small amounts, show more decimal places
    if (num < 0.000001) {
      return num.toFixed(8);
    }
    // For small amounts, show 6 decimal places
    else if (num < 0.01) {
      return num.toFixed(6);
    }
    // For normal amounts, show 4 decimal places
    else if (num < 1) {
      return num.toFixed(4);
    }
    // For larger amounts, show 2 decimal places
    else {
      return num.toFixed(2);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    }
    if (status === 'failed') {
      return <ArrowUpRight className="w-5 h-5 text-red-500" />;
    }
    if (type === 'send') {
      return <ArrowUpRight className="w-5 h-5 text-red-500" />;
    }
    if (type === 'receive') {
      return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
    }
    return <ArrowUpRight className="w-5 h-5 text-blue-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const openBlockExplorer = (hash: string) => {
    if (!currentNetwork?.blockExplorer) return;
    const url = `${currentNetwork.blockExplorer}/tx/${hash}`;
    window.open(url, '_blank');
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Wallet Connected</h1>
          <p className="text-gray-600">Please connect your wallet to view transaction history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-2">
            View all your recent transactions on {currentNetwork?.name || 'Unknown Network'}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'send', label: 'Sent' },
                  { key: 'receive', label: 'Received' },
                  { key: 'contract', label: 'Contract' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filter === key
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={loadTransactions}
              disabled={isLoadingTransactions}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoadingTransactions ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading transaction history...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadTransactions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No transactions found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.hash}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedTransaction(tx)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(tx.type, tx.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {tx.type === 'send' ? 'Sent' : tx.type === 'receive' ? 'Received' : 'Contract Interaction'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {tx.type === 'send' ? 'To' : 'From'}: {tx.type === 'send' ? tx.to : tx.from}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {tx.type === 'send' ? '-' : '+'}{formatAmount(tx.value)} {tx.tokenSymbol}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openBlockExplorer(tx.hash);
                        }}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View on Explorer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Hash</label>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all">
                      {selectedTransaction.hash}
                    </code>
                    <button
                      onClick={() => openBlockExplorer(selectedTransaction.hash)}
                      className="p-2 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all">
                      {selectedTransaction.from}
                    </code>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all">
                      {selectedTransaction.to}
                    </code>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <p className="text-lg font-semibold">
                      {formatAmount(selectedTransaction.value)} {selectedTransaction.tokenSymbol}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Block Number</label>
                    <p className="text-sm">{selectedTransaction.blockNumber.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gas Used</label>
                    <p className="text-sm">{parseInt(selectedTransaction.gasUsed).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                  <p className="text-sm">{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
