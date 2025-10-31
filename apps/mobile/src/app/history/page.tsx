'use client';

import React, { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { Layout } from '@/components/layout/Layout';
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
  const { address, currentNetwork, transactions, isLoadingTransactions, fetchTransactions } = useWalletStore();
  const [filter, setFilter] = useState<'all' | 'send' | 'receive' | 'contract'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (address && !hasLoadedOnce) {
      fetchTransactions();
      setHasLoadedOnce(true);
    }
  }, [address, hasLoadedOnce, fetchTransactions]);

  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    
    if (num < 0.000001) {
      return num.toFixed(8);
    } else if (num < 0.01) {
      return num.toFixed(6);
    } else if (num < 1) {
      return num.toFixed(4);
    } else {
      return num.toFixed(2);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getTransactionIcon = (type: string) => {
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
      <Layout title="Transaction History" subtitle="View your transaction history">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Wallet Connected</h1>
            <p className="text-gray-600">Please connect your wallet to view transaction history.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Transaction History" subtitle={`View all your recent transactions on ${currentNetwork?.name || 'Unknown Network'}`}>
      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>
              <div className="flex gap-2">
                {(['all', 'send', 'receive', 'contract'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filter === filterType
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => fetchTransactions()}
              disabled={isLoadingTransactions}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {isLoadingTransactions ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'You haven\'t made any transactions yet.'
                  : `No ${filter} transactions found.`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.hash}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {transaction.type}
                          </p>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {transaction.type === 'send' ? 'To: ' : 'From: '}
                          {transaction.type === 'send' ? transaction.to : transaction.from}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          transaction.type === 'receive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'receive' ? '+' : '-'}
                          {formatAmount(transaction.value)} {transaction.tokenSymbol || currentNetwork?.symbol || 'ETH'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Block #{transaction.blockNumber.toLocaleString()}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hash</label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                      {selectedTransaction.hash}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                      {selectedTransaction.from}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                      {selectedTransaction.to}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <p className="text-sm">
                      {formatAmount(selectedTransaction.value)} {selectedTransaction.tokenSymbol || currentNetwork?.symbol || 'ETH'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Block Number</label>
                    <p className="text-sm">{selectedTransaction.blockNumber.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gas Price</label>
                    <p className="text-sm">{parseInt(selectedTransaction.gasPrice).toLocaleString()} wei</p>
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
        )}
      </div>
    </Layout>
  );
}