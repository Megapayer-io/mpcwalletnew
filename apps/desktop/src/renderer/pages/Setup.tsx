import React from 'react'
import { DesktopLayout } from '../components/DesktopLayout'
import { Shield } from 'lucide-react'

export const Setup: React.FC = () => {
  return (
    <DesktopLayout title="Setup Wallet" subtitle="Create or import your wallet">
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Wallet</h2>
        <p className="text-gray-600">Desktop-optimized wallet setup coming soon...</p>
      </div>
    </DesktopLayout>
  )
}
