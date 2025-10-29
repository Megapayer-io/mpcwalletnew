'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { ReceiveForm } from '@/components/ReceiveForm';
import { CustomIcons } from '@/components/icons/CustomIcons';

export default function ReceivePage() {
  const router = useRouter();
  const { isUnlocked, address, currentNetwork } = useWalletStore();

  // Redirect to unlock page if wallet is locked
  useEffect(() => {
    if (!isUnlocked) {
      router.push('/unlock');
    }
  }, [isUnlocked, router]);

  // Show loading while redirecting
  if (!isUnlocked) {
    return (
      <div className="text-center py-6">
          <div className="w-12 h-12 bg-gradient-to-br from-megapayer-emerald via-megapayer-teal to-megapayer-violet rounded-lg flex items-center justify-center mx-auto mb-3 animate-pulse">
            <CustomIcons.Download className="w-6 h-6 text-white" />
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-megapayer-emerald mx-auto mb-2"></div>
          <h1 className="text-base font-bold text-megapayer-text mb-1">Redirecting to unlock page...</h1>
          <p className="text-sm text-megapayer-muted">
            Please wait while we redirect you to unlock your wallet.
          </p>
        </div>
    );
  }

  return (
      <div className="space-y-2">
        {/* Header Section */}
        <div className="megapayer-panel p-2 text-megapayer-text relative overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-megapayer-emerald/10 via-megapayer-teal/10 to-megapayer-violet/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-megapayer-emerald to-megapayer-teal rounded-lg flex items-center justify-center shadow-md">
                <CustomIcons.Download className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold mb-0 font-heading text-megapayer-text">Receive Funds</h1>
                <p className="text-megapayer-muted text-xs">Share your wallet address to receive payments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Receive Form */}
        <div className="megapayer-panel rounded-lg">
          <ReceiveForm />
        </div>
      </div>
  );
}