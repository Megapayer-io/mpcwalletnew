import React from 'react'
import { DesktopLayout } from '../components/DesktopLayout'
import { History as HistoryIcon } from 'lucide-react'

export const History: React.FC = () => {
  return (
    <DesktopLayout title="Transaction History" subtitle="View your transaction history">
      <div className="text-center py-12">
        <HistoryIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">History Page</h2>
        <p className="text-gray-600">Desktop-optimized history functionality coming soon...</p>
      </div>
    </DesktopLayout>
  )
}
