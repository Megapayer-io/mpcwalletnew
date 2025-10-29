'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

interface Transaction {
  hash: string;
  type: 'send' | 'receive';
  amount: string;
  to: string;
  from: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load recent transactions from storage
    const loadTransactions = async () => {
      try {
        const result = await chrome.storage.local.get(['recentTransactions']);
        const stored = result.recentTransactions || [];
        setTransactions(stored.slice(0, 5)); // Show only last 5
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const getTransactionIcon = (type: 'send' | 'receive') => {
    return type === 'send' ? ArrowUpRight : ArrowDownLeft;
  };

  const getTransactionColor = (type: 'send' | 'receive') => {
    return type === 'send' ? 'text-red-600' : 'text-green-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const openExplorer = (hash: string) => {
    const explorerUrl = `https://etherscan.io/tx/${hash}`;
    chrome.tabs.create({ url: explorerUrl });
  };

  if (isLoading) {
    return (
      <div className="wallet-card">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Transactions</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="wallet-card">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Transactions</h3>
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No transactions yet</p>
          <p className="text-gray-400 text-xs mt-1">Your transaction history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
        <button
          onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('popup.html#history') })}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {transactions.map((tx) => {
          const Icon = getTransactionIcon(tx.type);
          return (
            <div
              key={tx.hash}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => openExplorer(tx.hash)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                tx.type === 'send' ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <Icon className={`w-4 h-4 ${getTransactionColor(tx.type)}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {tx.type === 'send' ? 'Sent' : 'Received'}
                  </span>
                  <span className={`text-xs font-medium ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${getTransactionColor(tx.type)}`}>
                    {tx.type === 'send' ? '-' : '+'}{formatAmount(tx.amount)} ETH
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(tx.timestamp)}
                  </span>
                </div>
              </div>
              
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
