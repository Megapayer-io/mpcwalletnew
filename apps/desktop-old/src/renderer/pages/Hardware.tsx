import React from 'react'
import { Shield, CheckCircle, AlertCircle } from 'lucide-react'

const Hardware: React.FC = () => {
  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hardware Wallets</h1>
              <p className="text-gray-600">Connect and manage hardware wallets</p>
            </div>
          </div>
          
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-200 to-emerald-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Hardware Wallet Support</h3>
            <p className="text-gray-600 mb-6">Connect your hardware wallet for enhanced security</p>
            <div className="bg-gray-50 rounded-2xl p-6 max-w-md mx-auto">
              <h4 className="font-semibold text-gray-900 mb-4">Supported Wallets:</h4>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Ledger</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Trezor</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-700">Coming Soon: KeepKey</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hardware
