import React from 'react'
import { DesktopLayout } from '../components/DesktopLayout'
import { Settings as SettingsIcon } from 'lucide-react'

export const Settings: React.FC = () => {
  return (
    <DesktopLayout title="Settings" subtitle="Configure your wallet preferences">
      <div className="text-center py-12">
        <SettingsIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Desktop-optimized settings coming soon...</p>
      </div>
    </DesktopLayout>
  )
}
