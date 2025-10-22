import React from 'react'
import { DesktopLayout } from '../components/DesktopLayout'
import { Globe } from 'lucide-react'

export const Networks: React.FC = () => {
  return (
    <DesktopLayout title="Networks" subtitle="Manage blockchain networks">
      <div className="text-center py-12">
        <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Networks Page</h2>
        <p className="text-gray-600">Desktop-optimized network management coming soon...</p>
      </div>
    </DesktopLayout>
  )
}
