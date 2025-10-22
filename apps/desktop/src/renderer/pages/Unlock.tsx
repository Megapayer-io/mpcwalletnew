import React from 'react'
import { DesktopLayout } from '../components/DesktopLayout'
import { Lock } from 'lucide-react'

export const Unlock: React.FC = () => {
  return (
    <DesktopLayout title="Unlock Wallet" subtitle="Enter your password to unlock your wallet">
      <div className="text-center py-12">
        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Wallet</h2>
        <p className="text-gray-600">Desktop-optimized wallet unlock coming soon...</p>
      </div>
    </DesktopLayout>
  )
}
