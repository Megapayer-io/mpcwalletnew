'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/wallet';
import { ExtensionHeader } from '@/components/extension/ExtensionHeader';
import { AccountManager } from '@/components/extension/AccountManager';
import { NetworkManager } from '@/components/extension/NetworkManager';
import { SecuritySettings } from '@/components/extension/SecuritySettings';
import { TokenManager } from '@/components/extension/TokenManager';
import { HardwareWalletManager } from '@/components/extension/HardwareWalletManager';
import { SettingsTabs } from '@/components/extension/SettingsTabs';

export default function OptionsPage() {
  const { isUnlocked, address } = useWalletStore();
  const [activeTab, setActiveTab] = useState('account');

  if (!isUnlocked) {
    return (
      <div className="extension-options">
        <ExtensionHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Locked</h2>
            <p className="text-gray-600 mb-8">Please unlock your wallet to access settings</p>
            <button
              onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') })}
              className="wallet-button"
            >
              Open Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="extension-options">
      <ExtensionHeader />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your wallet preferences and security</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'account' && <AccountManager />}
            {activeTab === 'networks' && <NetworkManager />}
            {activeTab === 'tokens' && <TokenManager />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'hardware' && <HardwareWalletManager />}
          </div>
        </div>
      </div>
    </div>
  );
}
