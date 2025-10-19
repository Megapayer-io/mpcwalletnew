'use client';

import Link from 'next/link';
import { useWalletStore } from '@/store/wallet';
import { Wallet, Lock, Unlock } from 'lucide-react';

export function Header() {
  const { isUnlocked, address, currentNetwork, lock, logout } = useWalletStore();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Wallet className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">EVM Wallet</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/networks"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Networks
            </Link>
            <Link
              href="/send"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Send
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {isUnlocked && address && (
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600">
                  <div className="font-medium">{currentNetwork?.name}</div>
                  <div className="text-xs text-gray-500">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
                <button
                  onClick={lock}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Lock wallet"
                >
                  <Lock className="h-4 w-4" />
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
