import React from 'react'
import { DesktopLayout } from '../components/DesktopLayout'
import { Download } from 'lucide-react'

export const Receive: React.FC = () => {
  return (
    <DesktopLayout title="Receive Funds" subtitle="Share your wallet address to receive payments">
      <div className="text-center py-12">
        <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Receive Page</h2>
        <p className="text-gray-600">Desktop-optimized receive functionality coming soon...</p>
      </div>
    </DesktopLayout>
  )
}
