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
      return <CustomIcons.Send className="w-4 h-4 text-megapayer-accent" />;
    }
    if (type === 'receive') {
      return <CustomIcons.Download className="w-4 h-4 text-megapayer-emerald" />;
    }
    return <CustomIcons.Zap className="w-4 h-4 text-megapayer-violet" />;
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
        <div>
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-gradient-to-br from-megapayer-violet via-megapayer-teal to-megapayer-accent rounded-lg flex items-center justify-center mx-auto mb-3">
              <CustomIcons.History className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-sm font-bold text-megapayer-text mb-2">No Wallet Connected</h1>
            <p className="text-xs text-megapayer-muted">Please connect your wallet to view transaction history.</p>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-2">
        {/* Header Section - Compact */}
        <div className="megapayer-panel p-2 text-megapayer-text relative overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-megapayer-violet/10 via-megapayer-teal/10 to-megapayer-accent/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-megapayer-violet to-megapayer-teal rounded-lg flex items-center justify-center shadow-md">
                <CustomIcons.History className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold mb-0.5 font-heading text-megapayer-text">Transaction History</h1>
                <p className="text-megapayer-muted text-xs">View all your recent transactions on {currentNetwork?.name || 'Unknown Network'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="megapayer-panel p-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {(['all', 'send', 'receive', 'contract'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105 ${
                      filter === filterType
                        ? 'bg-gradient-to-r from-megapayer-teal to-megapayer-violet text-white shadow-md'
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
              className="flex items-center gap-1 px-2.5 py-1 megapayer-btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 text-xs"
            >
              <CustomIcons.Refresh className={`w-2.5 h-2.5 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
              <span className="font-semibold text-xs">Refresh</span>
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="megapayer-panel">
          {isLoadingTransactions ? (
            <div className="p-6 text-center">
              <div className="relative mx-auto mb-4">
                {/* Outer glow ring */}
                <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-megapayer-teal/20 via-megapayer-violet/20 to-megapayer-accent/20 animate-pulse"></div>
                
                {/* Animated gradient circle */}
                <div className="relative w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-megapayer-teal via-megapayer-violet to-megapayer-accent p-0.5 animate-spin" style={{ animationDuration: '2s' }}>
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <CustomIcons.History className="w-6 h-6 text-megapayer-teal" />
                  </div>
                </div>
                
                {/* Inner pulsing dot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-megapayer-teal rounded-full animate-ping"></div>
              </div>
              
              {/* Loading text with shimmer */}
              <div className="relative">
                <p className="text-xs text-megapayer-muted font-medium relative z-10">Loading transactions...</p>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-megapayer-teal/10 to-transparent animate-pulse"></div>
              </div>
              
              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                <div className="w-1.5 h-1.5 bg-megapayer-teal rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-1.5 h-1.5 bg-megapayer-violet rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-megapayer-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-lg flex items-center justify-center mx-auto mb-3">
                <CustomIcons.History className="w-7 h-7 text-megapayer-muted" />
              </div>
              <h3 className="text-sm font-bold text-megapayer-text mb-2 font-heading">No Transactions Found</h3>
              <p className="text-xs text-megapayer-muted mb-3">
                {filter === 'all' 
                  ? 'You haven\'t made any transactions yet.'
                  : `No ${filter} transactions found.`
                }
              </p>
              <button
                onClick={() => fetchTransactions()}
                className="px-2.5 py-1 megapayer-btn-primary rounded-lg hover:scale-105 transition-all duration-300 text-xs inline-flex items-center gap-1"
              >
                <CustomIcons.Refresh className="w-2.5 h-2.5" />
                <span>Refresh</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-megapayer-border">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.hash}
                  className="p-2 hover:bg-megapayer-panel-soft cursor-pointer transition-all duration-300 hover:scale-[1.01] group"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          {getTransactionIcon(transaction.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-xs font-semibold text-megapayer-text capitalize">
                            {transaction.type}
                          </p>
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                        <p className="text-xs text-megapayer-muted truncate mb-0.5">
                          {transaction.type === 'send' ? 'To: ' : 'From: '}
                          {transaction.type === 'send' ? transaction.to : transaction.from}
                        </p>
                        <p className="text-[10px] text-megapayer-muted">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className={`text-xs font-semibold ${
                          transaction.type === 'receive' ? 'text-megapayer-emerald' : 'text-megapayer-accent'
                        }`}>
                          {transaction.type === 'receive' ? '+' : '-'}
                          {formatAmount(transaction.value)} {transaction.tokenSymbol || currentNetwork?.symbol || 'ETH'}
                        </p>
                        <p className="text-[10px] text-megapayer-muted">
                          Block #{transaction.blockNumber.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openBlockExplorer(transaction.hash);
                        }}
                        className="p-1.5 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-all duration-300 hover:scale-110"
                      >
                        <CustomIcons.ExternalLink className="w-3.5 h-3.5" />
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
            <div className="megapayer-panel max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-3 border-b border-megapayer-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-megapayer-violet to-megapayer-teal rounded-lg flex items-center justify-center shadow-md">
                      <CustomIcons.History className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-megapayer-text font-heading">Transaction Details</h3>
                  </div>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="p-1.5 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-all duration-300 hover:scale-110"
                  >
                    <CustomIcons.X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                    <label className="block text-xs font-semibold text-megapayer-text mb-1">Hash</label>
                    <p className="text-xs font-mono text-megapayer-muted break-all">
                      {selectedTransaction.hash}
                    </p>
                  </div>
                  <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                    <label className="block text-xs font-semibold text-megapayer-text mb-1">Status</label>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                    <label className="block text-xs font-semibold text-megapayer-text mb-1">From</label>
                    <p className="text-xs font-mono text-megapayer-muted break-all">
                      {selectedTransaction.from}
                    </p>
                  </div>
                  <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                    <label className="block text-xs font-semibold text-megapayer-text mb-1">To</label>
                    <p className="text-xs font-mono text-megapayer-muted break-all">
                      {selectedTransaction.to}
                    </p>
                  </div>
                  <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                    <label className="block text-xs font-semibold text-megapayer-text mb-1">Value</label>
                    <p className="text-xs font-semibold text-megapayer-text">
                      {formatAmount(selectedTransaction.value)} {selectedTransaction.tokenSymbol || currentNetwork?.symbol || 'ETH'}
                    </p>
                  </div>
                  <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                    <label className="block text-xs font-semibold text-megapayer-text mb-1">Block Number</label>
                    <p className="text-xs text-megapayer-text">{selectedTransaction.blockNumber.toLocaleString()}</p>
                  </div>
                  <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                    <label className="block text-xs font-semibold text-megapayer-text mb-1">Gas Price</label>
                    <p className="text-xs text-megapayer-text">{parseInt(selectedTransaction.gasPrice).toLocaleString()} wei</p>
                  </div>
                  <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                    <label className="block text-xs font-semibold text-megapayer-text mb-1">Gas Used</label>
                    <p className="text-xs text-megapayer-text">{parseInt(selectedTransaction.gasUsed).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="megapayer-panel-soft p-2 rounded-lg border border-megapayer-border-soft">
                  <label className="block text-xs font-semibold text-megapayer-text mb-1">Timestamp</label>
                  <p className="text-xs text-megapayer-text">{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}