'use client';

import React, { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';

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
      return <CustomIcons.Send className="w-5 h-5 text-megapayer-accent" />;
    }
    if (type === 'receive') {
      return <CustomIcons.Download className="w-5 h-5 text-megapayer-emerald" />;
    }
    return <CustomIcons.Zap className="w-5 h-5 text-megapayer-violet" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-megapayer-emerald bg-megapayer-emerald/10 border-megapayer-emerald/20';
      case 'pending': return 'text-megapayer-accent bg-megapayer-accent/10 border-megapayer-accent/20';
      case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-megapayer-muted bg-megapayer-panel-soft border-megapayer-border-soft';
    }
  };

  const openBlockExplorer = (hash: string) => {
    if (!currentNetwork?.blockExplorer) return;
    const url = `${currentNetwork.blockExplorer}/tx/${hash}`;
    window.open(url, '_blank');
  };

  if (!address) {
    return (
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-megapayer-violet via-megapayer-teal to-megapayer-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CustomIcons.History className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-megapayer-text mb-4">No Wallet Connected</h1>
            <p className="text-megapayer-muted">Please connect your wallet to view transaction history.</p>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="megapayer-panel p-8 text-megapayer-text relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-megapayer-violet/10 via-megapayer-teal/10 to-megapayer-accent/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-megapayer-violet to-megapayer-teal rounded-2xl flex items-center justify-center shadow-lg">
                <CustomIcons.History className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 font-heading text-megapayer-text">Transaction History</h1>
                <p className="text-megapayer-muted text-lg">View all your recent transactions on {currentNetwork?.name || 'Unknown Network'}</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-megapayer-violet/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-megapayer-teal/5 rounded-full"></div>
        </div>

        {/* Controls */}
        <div className="megapayer-panel p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald rounded-xl flex items-center justify-center shadow-lg">
                  <CustomIcons.Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-megapayer-text">Filter Transactions</span>
                  <p className="text-xs text-megapayer-muted">Choose transaction type</p>
                </div>
              </div>
              <div className="flex gap-2">
                {(['all', 'send', 'receive', 'contract'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      filter === filterType
                        ? 'bg-gradient-to-r from-megapayer-teal to-megapayer-violet text-white shadow-lg'
                        : 'bg-megapayer-panel-soft text-megapayer-text hover:bg-megapayer-panel border border-megapayer-border-soft'
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
              className="flex items-center gap-2 px-6 py-3 megapayer-btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
            >
              <CustomIcons.Refresh className={`w-4 h-4 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
              <span className="font-semibold">Refresh</span>
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="megapayer-panel">
          {isLoadingTransactions ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-megapayer-teal via-megapayer-violet to-megapayer-accent rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <CustomIcons.History className="w-8 h-8 text-white" />
              </div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal mx-auto mb-4"></div>
              <p className="text-megapayer-muted font-medium">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CustomIcons.History className="w-10 h-10 text-megapayer-muted" />
              </div>
              <h3 className="text-xl font-bold text-megapayer-text mb-3 font-heading">No Transactions Found</h3>
              <p className="text-megapayer-muted mb-6">
                {filter === 'all' 
                  ? 'You haven\'t made any transactions yet.'
                  : `No ${filter} transactions found.`
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => fetchTransactions()}
                  className="px-6 py-3 megapayer-btn-primary rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <CustomIcons.Refresh className="w-5 h-5 mr-2" />
                  Refresh Transactions
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-megapayer-border">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.hash}
                  className="p-6 hover:bg-megapayer-panel-soft cursor-pointer transition-all duration-300 hover:scale-[1.01] group"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          {getTransactionIcon(transaction.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="text-sm font-semibold text-megapayer-text capitalize">
                            {transaction.type}
                          </p>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                        <p className="text-sm text-megapayer-muted truncate mb-1">
                          {transaction.type === 'send' ? 'To: ' : 'From: '}
                          {transaction.type === 'send' ? transaction.to : transaction.from}
                        </p>
                        <p className="text-xs text-megapayer-muted">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          transaction.type === 'receive' ? 'text-megapayer-emerald' : 'text-megapayer-accent'
                        }`}>
                          {transaction.type === 'receive' ? '+' : '-'}
                          {formatAmount(transaction.value)} {transaction.tokenSymbol || currentNetwork?.symbol || 'ETH'}
                        </p>
                        <p className="text-xs text-megapayer-muted">
                          Block #{transaction.blockNumber.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openBlockExplorer(transaction.hash);
                        }}
                        className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
                      >
                        <CustomIcons.ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="megapayer-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-megapayer-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-megapayer-violet to-megapayer-teal rounded-xl flex items-center justify-center shadow-lg">
                      <CustomIcons.History className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-megapayer-text font-heading">Transaction Details</h3>
                  </div>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-110"
                  >
                    <CustomIcons.X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                    <label className="block text-sm font-semibold text-megapayer-text mb-2">Hash</label>
                    <p className="text-sm font-mono text-megapayer-muted break-all">
                      {selectedTransaction.hash}
                    </p>
                  </div>
                  <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                    <label className="block text-sm font-semibold text-megapayer-text mb-2">Status</label>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                    <label className="block text-sm font-semibold text-megapayer-text mb-2">From</label>
                    <p className="text-sm font-mono text-megapayer-muted break-all">
                      {selectedTransaction.from}
                    </p>
                  </div>
                  <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                    <label className="block text-sm font-semibold text-megapayer-text mb-2">To</label>
                    <p className="text-sm font-mono text-megapayer-muted break-all">
                      {selectedTransaction.to}
                    </p>
                  </div>
                  <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                    <label className="block text-sm font-semibold text-megapayer-text mb-2">Value</label>
                    <p className="text-sm font-semibold text-megapayer-text">
                      {formatAmount(selectedTransaction.value)} {selectedTransaction.tokenSymbol || currentNetwork?.symbol || 'ETH'}
                    </p>
                  </div>
                  <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                    <label className="block text-sm font-semibold text-megapayer-text mb-2">Block Number</label>
                    <p className="text-sm text-megapayer-text">{selectedTransaction.blockNumber.toLocaleString()}</p>
                  </div>
                  <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                    <label className="block text-sm font-semibold text-megapayer-text mb-2">Gas Price</label>
                    <p className="text-sm text-megapayer-text">{parseInt(selectedTransaction.gasPrice).toLocaleString()} wei</p>
                  </div>
                  <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                    <label className="block text-sm font-semibold text-megapayer-text mb-2">Gas Used</label>
                    <p className="text-sm text-megapayer-text">{parseInt(selectedTransaction.gasUsed).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="megapayer-panel-soft p-4 rounded-xl border border-megapayer-border-soft">
                  <label className="block text-sm font-semibold text-megapayer-text mb-2">Timestamp</label>
                  <p className="text-sm text-megapayer-text">{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}