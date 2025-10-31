'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { Loader } from '@/components/Loader';
import { motion, AnimatePresence } from 'framer-motion';

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

// Beautiful SVG Graphics for History Page
const HistoryIcon = () => (
  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="historyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <filter id="glowHistory">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Circle */}
    <circle cx="70" cy="70" r="65" fill="rgba(34, 225, 255, 0.08)" />
    
    {/* Clock Face */}
    <motion.circle
      cx="70"
      cy="70"
      r="45"
      fill="none"
      stroke="url(#historyGradient)"
      strokeWidth="4"
      filter="url(#glowHistory)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
    
    {/* Clock Center */}
    <circle cx="70" cy="70" r="4" fill="url(#historyGradient)" filter="url(#glowHistory)" />
    
    {/* Clock Hands */}
    <motion.line
      x1="70"
      y1="70"
      x2="70"
      y2="40"
      stroke="url(#historyGradient)"
      strokeWidth="3"
      strokeLinecap="round"
      filter="url(#glowHistory)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    />
    <motion.line
      x1="70"
      y1="70"
      x2="85"
      y2="70"
      stroke="url(#historyGradient)"
      strokeWidth="3"
      strokeLinecap="round"
      filter="url(#glowHistory)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    />
    
    {/* Hour Markers */}
    {[...Array(12)].map((_, i) => {
      const angle = (i * 30 - 90) * Math.PI / 180;
      const x1 = 70 + Math.cos(angle) * 38;
      const y1 = 70 + Math.sin(angle) * 38;
      const x2 = 70 + Math.cos(angle) * 45;
      const y2 = 70 + Math.sin(angle) * 45;
      return (
        <motion.line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="url(#historyGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 + i * 0.05, duration: 0.3 }}
        />
      );
    })}
    
    {/* Floating Particles */}
    {[...Array(6)].map((_, i) => {
      const angle = (i * 60) * Math.PI / 180;
      const radius = 60;
      const x = 70 + Math.cos(angle) * radius;
      const y = 70 + Math.sin(angle) * radius;
      return (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="3"
          fill="#7C3AED"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0]
          }}
          transition={{
            delay: 1.5 + i * 0.2,
            duration: 2,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

export default function HistoryPage() {
  const router = useRouter();
  const { 
    address, 
    currentNetwork, 
    transactions, 
    isLoadingTransactions, 
    fetchTransactions,
    isInitialized,
    isUnlocked
  } = useWalletStore();
  const [filter, setFilter] = useState<'all' | 'send' | 'receive' | 'contract'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (isInitialized && !isUnlocked) {
      router.push('/unlock');
    }
  }, [isInitialized, isUnlocked, router]);

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

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getTransactionIcon = (type: string) => {
    if (type === 'send') {
      return <CustomIcons.Send className="w-5 h-5 text-[#FF7A45]" />;
    }
    if (type === 'receive') {
      return <CustomIcons.Download className="w-5 h-5 text-[#34D399]" />;
    }
    return <CustomIcons.Zap className="w-5 h-5 text-[#7C3AED]" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-[#34D39920] text-[#34D399] border-[#34D39930]';
      case 'pending': return 'bg-[#FF7A4520] text-[#FF7A45] border-[#FF7A4530]';
      case 'failed': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-megapayer-panel-soft text-megapayer-muted border-megapayer-border';
    }
  };

  const openBlockExplorer = (hash: string) => {
    if (!currentNetwork?.blockExplorer) return;
    const url = `${currentNetwork.blockExplorer}/tx/${hash}`;
    window.open(url, '_blank');
  };

  if (!isInitialized || !isUnlocked) {
    return null;
  }

  if (!address) {
    return (
      <div className="min-h-screen megapayer-bg flex flex-col relative overflow-hidden pb-24">
        <div className="px-5 pt-6 pb-4 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#7C3AED15] flex-shrink-0">
              <HistoryIcon />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold font-heading text-megapayer-text">History</h1>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="text-center">
            <div className="w-20 h-20 bg-megapayer-panel-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CustomIcons.History className="w-10 h-10 text-megapayer-muted" />
            </div>
            <h3 className="text-base font-bold font-heading text-megapayer-text mb-2">No Wallet Connected</h3>
            <p className="text-sm font-body text-megapayer-muted">Please connect your wallet to view transaction history.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen megapayer-bg flex flex-col relative overflow-hidden pb-24">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-8"
          style={{
            background: `linear-gradient(135deg, rgba(124,58,237,0.2), rgba(34,225,255,0.15))`
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header Section */}
      <div className="px-5 pt-6 pb-3 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#7C3AED15] flex-shrink-0">
            <HistoryIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-heading text-megapayer-text">History</h1>
            <p className="text-sm font-body text-megapayer-muted mt-0.5">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'} on {currentNetwork?.name || 'network'}
            </p>
          </div>
          <motion.button
            onClick={() => fetchTransactions()}
            disabled={isLoadingTransactions}
            whileHover={{ scale: isLoadingTransactions ? 1 : 1.1 }}
            whileTap={{ scale: isLoadingTransactions ? 1 : 0.9 }}
            className="p-2 rounded-xl hover:bg-megapayer-panel-soft transition-colors disabled:opacity-50"
            title="Refresh transactions"
          >
            <CustomIcons.Refresh className={`w-5 h-5 text-megapayer-text ${isLoadingTransactions ? 'animate-spin' : ''}`} />
          </motion.button>
        </motion.div>

        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['all', 'send', 'receive', 'contract'] as const).map((filterType) => (
            <motion.button
              key={filterType}
              onClick={() => setFilter(filterType)}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold font-heading whitespace-nowrap transition-all ${
                filter === filterType
                  ? 'megapayer-btn-primary text-white'
                  : 'megapayer-panel-soft text-megapayer-text border border-megapayer-border'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 relative z-10">
        {isLoadingTransactions ? (
          <Loader text="Loading transactions..." size="md" />
        ) : filteredTransactions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-megapayer-panel-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CustomIcons.History className="w-10 h-10 text-megapayer-muted" />
              </div>
              <h3 className="text-base font-bold font-heading text-megapayer-text mb-2">No Transactions Found</h3>
              <p className="text-sm font-body text-megapayer-muted mb-4">
                {filter === 'all' 
                  ? 'You haven\'t made any transactions yet.'
                  : `No ${filter} transactions found.`
                }
              </p>
              <motion.button
                onClick={() => fetchTransactions()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="megapayer-btn-primary px-6 py-3 rounded-xl font-semibold font-heading flex items-center justify-center gap-2 mx-auto"
              >
                <CustomIcons.Refresh className="w-4 h-4" />
                Refresh
              </motion.button>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.hash}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTransaction(transaction)}
                className="megapayer-panel rounded-xl border border-megapayer-border p-4 active:scale-95 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-megapayer-panel-soft flex items-center justify-center flex-shrink-0">
                    {getTransactionIcon(transaction.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold font-heading text-megapayer-text capitalize">
                        {transaction.type}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                    <p className="text-xs font-body text-megapayer-muted truncate mb-1">
                      {transaction.type === 'send' ? 'To: ' : transaction.type === 'receive' ? 'From: ' : ''}
                      {transaction.type === 'send' ? transaction.to.slice(0, 6) + '...' + transaction.to.slice(-4) : 
                       transaction.type === 'receive' ? transaction.from.slice(0, 6) + '...' + transaction.from.slice(-4) :
                       'Contract interaction'}
                    </p>
                    <p className="text-xs font-body text-megapayer-muted">
                      {formatDate(transaction.timestamp)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold font-heading ${
                      transaction.type === 'receive' ? 'text-[#34D399]' : 'text-[#FF7A45]'
                    }`}>
                      {transaction.type === 'receive' ? '+' : '-'}
                      {formatAmount(transaction.value)} {transaction.tokenSymbol || currentNetwork?.symbol || 'ETH'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Details Modal - Mobile Friendly Bottom Sheet */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 megapayer-panel rounded-t-3xl border-t border-megapayer-border overflow-hidden"
              style={{ 
                height: '85vh',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Drag Handle */}
              <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
                <div className="w-12 h-1.5 bg-megapayer-muted/30 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-megapayer-border flex-shrink-0">
                <h3 className="text-lg font-bold font-heading text-megapayer-text">Transaction Details</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 hover:bg-megapayer-panel-soft rounded-lg transition-colors"
                >
                  <CustomIcons.X className="w-5 h-5 text-megapayer-muted" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
                {/* Status Card */}
                <div className="megapayer-panel-soft p-4 rounded-xl">
                  <label className="block text-xs font-semibold font-heading text-megapayer-text mb-2">Status</label>
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border inline-block ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>

                {/* Hash */}
                <div className="megapayer-panel-soft p-4 rounded-xl">
                  <label className="block text-xs font-semibold font-heading text-megapayer-text mb-2">Transaction Hash</label>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono font-body text-megapayer-text break-all flex-1">
                      {selectedTransaction.hash}
                    </p>
                    <motion.button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedTransaction.hash);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-megapayer-panel rounded-lg transition-colors"
                    >
                      <CustomIcons.Copy className="w-4 h-4 text-megapayer-muted" />
                    </motion.button>
                    <motion.button
                      onClick={() => openBlockExplorer(selectedTransaction.hash)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-megapayer-panel rounded-lg transition-colors"
                    >
                      <CustomIcons.ExternalLink className="w-4 h-4 text-megapayer-muted" />
                    </motion.button>
                  </div>
                </div>

                {/* From */}
                <div className="megapayer-panel-soft p-4 rounded-xl">
                  <label className="block text-xs font-semibold font-heading text-megapayer-text mb-2">From</label>
                  <p className="text-xs font-mono font-body text-megapayer-text break-all">
                    {selectedTransaction.from}
                  </p>
                </div>

                {/* To */}
                <div className="megapayer-panel-soft p-4 rounded-xl">
                  <label className="block text-xs font-semibold font-heading text-megapayer-text mb-2">To</label>
                  <p className="text-xs font-mono font-body text-megapayer-text break-all">
                    {selectedTransaction.to}
                  </p>
                </div>

                {/* Value */}
                <div className="megapayer-panel-soft p-4 rounded-xl">
                  <label className="block text-xs font-semibold font-heading text-megapayer-text mb-2">Value</label>
                  <p className="text-sm font-bold font-heading text-megapayer-text">
                    {formatAmount(selectedTransaction.value)} {selectedTransaction.tokenSymbol || currentNetwork?.symbol || 'ETH'}
                  </p>
                </div>

                {/* Block Number */}
                <div className="megapayer-panel-soft p-4 rounded-xl">
                  <label className="block text-xs font-semibold font-heading text-megapayer-text mb-2">Block Number</label>
                  <p className="text-sm font-body text-megapayer-text">{selectedTransaction.blockNumber.toLocaleString()}</p>
                </div>

                {/* Gas Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="megapayer-panel-soft p-3 rounded-xl">
                    <label className="block text-xs font-semibold font-heading text-megapayer-text mb-1">Gas Price</label>
                    <p className="text-xs font-body text-megapayer-text">{parseInt(selectedTransaction.gasPrice).toLocaleString()} wei</p>
                  </div>
                  <div className="megapayer-panel-soft p-3 rounded-xl">
                    <label className="block text-xs font-semibold font-heading text-megapayer-text mb-1">Gas Used</label>
                    <p className="text-xs font-body text-megapayer-text">{parseInt(selectedTransaction.gasUsed).toLocaleString()}</p>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="megapayer-panel-soft p-4 rounded-xl">
                  <label className="block text-xs font-semibold font-heading text-megapayer-text mb-2">Timestamp</label>
                  <p className="text-sm font-body text-megapayer-text">{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
