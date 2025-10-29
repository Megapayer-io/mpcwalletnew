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
      <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-megapayer-emerald via-megapayer-teal to-megapayer-violet rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CustomIcons.Download className="w-10 h-10 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-emerald mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-megapayer-text mb-2">Redirecting to unlock page...</h1>
          <p className="text-megapayer-muted">
            Please wait while we redirect you to unlock your wallet.
          </p>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="megapayer-panel p-8 text-megapayer-text relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-megapayer-emerald/10 via-megapayer-teal/10 to-megapayer-violet/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-megapayer-emerald to-megapayer-teal rounded-2xl flex items-center justify-center shadow-lg">
                <CustomIcons.Download className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 font-heading text-megapayer-text">Receive Funds</h1>
                <p className="text-megapayer-muted text-lg">Share your wallet address to receive payments</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-megapayer-emerald/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-megapayer-teal/5 rounded-full"></div>
        </div>

        {/* Receive Form */}
        <div className="megapayer-panel">
          <ReceiveForm />
        </div>
        
        {/* Important Information */}
        <div className="megapayer-panel p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-megapayer-violet to-megapayer-teal rounded-xl flex items-center justify-center shadow-lg">
              <CustomIcons.Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-megapayer-text font-heading">Important Information</h3>
              <p className="text-megapayer-muted">Essential details for receiving funds safely</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 megapayer-panel-soft rounded-xl border border-megapayer-border-soft">
              <CustomIcons.Globe className="w-5 h-5 text-megapayer-teal mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-megapayer-text mb-1">Network Compatibility</h4>
                <p className="text-sm text-megapayer-muted">
                  Make sure the sender is using the same network ({currentNetwork?.name}) as your wallet.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 megapayer-panel-soft rounded-xl border border-megapayer-border-soft">
              <CustomIcons.CheckCircle className="w-5 h-5 text-megapayer-emerald mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-megapayer-text mb-1">Address Verification</h4>
                <p className="text-sm text-megapayer-muted">
                  Always verify the address before sharing. This address is unique to your wallet.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 megapayer-panel-soft rounded-xl border border-megapayer-border-soft">
              <CustomIcons.Zap className="w-5 h-5 text-megapayer-accent mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-megapayer-text mb-1">Token Support</h4>
                <p className="text-sm text-megapayer-muted">
                  This address can receive {currentNetwork?.symbol} and compatible tokens on the {currentNetwork?.name} network.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 megapayer-panel-soft rounded-xl border border-megapayer-border-soft">
              <CustomIcons.Shield className="w-5 h-5 text-megapayer-violet mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-megapayer-text mb-1">Security Notice</h4>
                <p className="text-sm text-megapayer-muted">
                  Never share your private key or seed phrase. Only share your public address.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}