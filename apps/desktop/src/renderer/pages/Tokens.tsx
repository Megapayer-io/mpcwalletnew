import React from 'react'
import { DesktopLayout } from '../components/DesktopLayout'
import { Zap } from 'lucide-react'

export const Tokens: React.FC = () => {
  return (
    <DesktopLayout title="Import Tokens" subtitle="Add custom ERC-20 tokens to your wallet">
      <div className="text-center py-12">
        <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Tokens</h2>
        <p className="text-gray-600">Desktop-optimized token management coming soon...</p>
      </div>
    </DesktopLayout>
  )
}
