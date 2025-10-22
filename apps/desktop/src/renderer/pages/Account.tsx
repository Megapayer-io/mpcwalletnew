import React from 'react'
import { DesktopLayout } from '../components/DesktopLayout'
import { User } from 'lucide-react'

export const Account: React.FC = () => {
  return (
    <DesktopLayout title="Account Management" subtitle="Manage your wallet account and settings">
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Management</h2>
        <p className="text-gray-600">Desktop-optimized account management coming soon...</p>
      </div>
    </DesktopLayout>
  )
}
