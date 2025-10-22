import React from 'react'
import { DesktopLayout } from '../components/DesktopLayout'
import { Image } from 'lucide-react'

export const NFTs: React.FC = () => {
  return (
    <DesktopLayout title="NFTs" subtitle="Manage your NFT collection">
      <div className="text-center py-12">
        <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">NFTs Page</h2>
        <p className="text-gray-600">Desktop-optimized NFT functionality coming soon...</p>
      </div>
    </DesktopLayout>
  )
}
