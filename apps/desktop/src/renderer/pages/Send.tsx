import React from 'react'
import { DesktopLayout } from '../components/DesktopLayout'
import { Send as SendIcon } from 'lucide-react'

export const Send: React.FC = () => {
  return (
    <DesktopLayout title="Send Transaction" subtitle="Transfer tokens to any address">
      <div className="text-center py-12">
        <SendIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Page</h2>
        <p className="text-gray-600">Desktop-optimized send functionality coming soon...</p>
      </div>
    </DesktopLayout>
  )
}
