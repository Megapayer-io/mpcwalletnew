import React from 'react'
import { Settings as SettingsIcon, Shield, Bell, Globe, Palette, Info } from 'lucide-react'

const Settings: React.FC = () => {
  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Customize your wallet experience</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Security</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage your wallet security settings</p>
              <button className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                Security Settings
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
              </div>
              <p className="text-gray-600 mb-4">Configure notification preferences</p>
              <button className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                Notification Settings
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Language</h3>
              </div>
              <p className="text-gray-600 mb-4">Change your language preference</p>
              <button className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                Language Settings
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-6 h-6 text-pink-600" />
                <h3 className="text-xl font-bold text-gray-900">Appearance</h3>
              </div>
              <p className="text-gray-600 mb-4">Customize the app appearance</p>
              <button className="w-full py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors">
                Appearance Settings
              </button>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-gray-600" />
              <h3 className="text-xl font-bold text-gray-900">About</h3>
            </div>
            <div className="space-y-2 text-gray-600">
              <p>MPC Wallet Desktop v1.0.0</p>
              <p>Built with Electron and React</p>
              <p>© 2024 MPC Wallet. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings