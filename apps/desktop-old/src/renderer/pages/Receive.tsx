import React, { useState } from 'react'
import { Copy, QrCode, Download as DownloadIcon, Share2 } from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import toast from 'react-hot-toast'

const Receive: React.FC = () => {
  const { currentAccount, currentNetwork } = useWalletStore()
  const [showQR, setShowQR] = useState(true)

  const copyAddress = () => {
    navigator.clipboard.writeText(currentAccount?.address || '')
    toast.success('Address copied to clipboard')
  }

  const shareAddress = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Wallet Address',
        text: `Send ${currentNetwork?.symbol || 'ETH'} to:`,
        url: currentAccount?.address || ''
      })
    } else {
      copyAddress()
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DownloadIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Receive</h1>
              <p className="text-gray-600">Share your address to receive tokens</p>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Address</h2>
              <button
                onClick={() => setShowQR(!showQR)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <QrCode className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {showQR ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 inline-block mb-6">
                <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <p className="text-gray-600 mb-2">Your wallet address:</p>
                <p className="font-mono text-lg text-gray-900 break-all">
                  {currentAccount?.address || 'No address available'}
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
              >
                <Copy className="w-5 h-5" />
                Copy Address
              </button>
              <button
                onClick={shareAddress}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Network Info */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Network Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Network</span>
              <span className="font-semibold">{currentNetwork?.name || 'Ethereum'}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Symbol</span>
              <span className="font-semibold">{currentNetwork?.symbol || 'ETH'}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Chain ID</span>
              <span className="font-semibold">{currentNetwork?.chainId || '1'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Receive