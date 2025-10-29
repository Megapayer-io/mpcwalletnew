'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { ExtensionHeader } from '@/components/extension/ExtensionHeader';
import { WalletStatus } from '@/components/extension/WalletStatus';
import { QuickActions } from '@/components/extension/QuickActions';
import { RecentTransactions } from '@/components/extension/RecentTransactions';
import { NetworkSelector } from '@/components/extension/NetworkSelector';
import { UnlockModal } from '@/components/extension/UnlockModal';
import { SendModal } from '@/components/extension/SendModal';
import { ReceiveModal } from '@/components/extension/ReceiveModal';

export default function PopupPage() {
  const { isUnlocked, address, currentNetwork, balance } = useWalletStore();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  useEffect(() => {
    // Initialize wallet state when popup opens
    if (!isUnlocked) {
      setShowUnlockModal(true);
    }
  }, [isUnlocked]);

  if (!isUnlocked) {
    return (
      <div className="extension-popup bg-gray-50">
        <ExtensionHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Locked</h3>
            <p className="text-gray-600 mb-4">Click to unlock your wallet</p>
            <button
              onClick={() => setShowUnlockModal(true)}
              className="wallet-button"
            >
              Unlock Wallet
            </button>
          </div>
        </div>
        {showUnlockModal && (
          <UnlockModal
            isOpen={showUnlockModal}
            onClose={() => setShowUnlockModal(false)}
            onSuccess={() => setShowUnlockModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="extension-popup bg-gray-50 flex flex-col">
      <ExtensionHeader />
      
      <div className="flex-1 overflow-y-auto extension-scrollbar">
        <div className="p-4 space-y-4">
          {/* Wallet Status */}
          <WalletStatus 
            address={address}
            balance={balance}
            network={currentNetwork}
          />

          {/* Network Selector */}
          <NetworkSelector />

          {/* Quick Actions */}
          <QuickActions
            onSend={() => setShowSendModal(true)}
            onReceive={() => setShowReceiveModal(true)}
          />

          {/* Recent Transactions */}
          <RecentTransactions />
        </div>
      </div>

      {/* Modals */}
      {showUnlockModal && (
        <UnlockModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          onSuccess={() => setShowUnlockModal(false)}
        />
      )}

      {showSendModal && (
        <SendModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
        />
      )}

      {showReceiveModal && (
        <ReceiveModal
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
        />
      )}
    </div>
  );
}
