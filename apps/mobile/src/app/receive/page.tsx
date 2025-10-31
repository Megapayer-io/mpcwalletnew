'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { Layout } from '@/components/layout/Layout';
import { ReceiveForm } from '@/components/ReceiveForm';
import { AlertCircle, Info } from 'lucide-react';

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
      <Layout title="Receive Funds" subtitle="Share your wallet address to receive payments">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting to unlock page...</h1>
          <p className="text-gray-600">
            Please wait while we redirect you to unlock your wallet.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Receive Funds" subtitle="Share your wallet address to receive payments">
      <div className="max-w-4xl mx-auto space-y-6">
        <ReceiveForm />
        
        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Important Information</h3>
              <div className="text-blue-800 text-sm space-y-2">
                <p>
                  <strong>Network:</strong> Make sure the sender is using the same network ({currentNetwork?.name}) as your wallet.
                </p>
                <p>
                  <strong>Address Verification:</strong> Always verify the address before sharing. This address is unique to your wallet.
                </p>
                <p>
                  <strong>Token Support:</strong> This address can receive {currentNetwork?.symbol} and compatible tokens on the {currentNetwork?.name} network.
                </p>
                <p>
                  <strong>Security:</strong> Never share your private key or seed phrase. Only share your public address.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}