import React, { useState } from 'react'
import { 
  Send, 
  QrCode, 
  Copy, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  Zap,
  Clock,
  Shield
} from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import toast from 'react-hot-toast'

const SendPage: React.FC = () => {
  const { currentAccount, balance, currentNetwork } = useWalletStore()
  const [formData, setFormData] = useState({
    to: '',
    amount: '',
    memo: ''
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form')

  const handleSend = async () => {
    if (!formData.to.trim()) {
      toast.error('Please enter recipient address')
      return
    }
    if (!formData.amount.trim()) {
      toast.error('Please enter amount')
      return
    }
    if (parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }
    if (parseFloat(formData.amount) > parseFloat(balance)) {
      toast.error('Insufficient balance')
      return
    }

    setLoading(true)
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      setStep('success')
      toast.success('Transaction sent successfully!')
    } catch (error) {
      toast.error('Transaction failed')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(currentAccount?.address || '')
    toast.success('Address copied to clipboard')
  }

  if (step === 'success') {
    return (
      <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Transaction Sent!</h1>
            <p className="text-gray-600 mb-8">
              Your transaction has been submitted to the network and will be confirmed shortly.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Transaction Details</h3>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-mono text-sm">{formData.to.slice(0, 6)}...{formData.to.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">{formData.amount} {currentNetwork?.symbol || 'ETH'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-semibold">{currentNetwork?.name || 'Ethereum'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setStep('form')
                setFormData({ to: '', amount: '', memo: '' })
              }}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
            >
              Send Another Transaction
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Send</h1>
              <p className="text-gray-600">Transfer tokens to another address</p>
            </div>
          </div>

          {/* Balance Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {balance} {currentNetwork?.symbol || 'ETH'}
                </p>
                <p className="text-sm text-gray-500">
                  ≈ ${(parseFloat(balance) * 2000).toFixed(2)} USD
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {currentNetwork?.symbol?.charAt(0) || 'E'}
              </div>
            </div>
          </div>
        </div>

        {/* Send Form */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <form onSubmit={(e) => { e.preventDefault(); setStep('confirm') }} className="space-y-6">
            {/* Recipient Address */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Recipient Address</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-4 py-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <QrCode className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.0001"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-4 pr-20 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <span className="text-gray-500 font-medium">{currentNetwork?.symbol || 'ETH'}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: balance })}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                ≈ ${(parseFloat(formData.amount || '0') * 2000).toFixed(2)} USD
              </p>
            </div>

            {/* Memo */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Memo (Optional)</label>
              <input
                type="text"
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                placeholder="Add a note for this transaction"
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Security Notice */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="text-orange-800 font-semibold mb-1">Security Notice</h4>
                  <p className="text-orange-700 text-sm">
                    Always verify the recipient address before sending. Transactions cannot be reversed.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!formData.to.trim() || !formData.amount.trim()}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Review
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Scan QR</h3>
            <p className="text-gray-600 text-sm">Scan address from QR code</p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Copy className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Paste Address</h3>
            <p className="text-gray-600 text-sm">Paste from clipboard</p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Quick Send</h3>
            <p className="text-gray-600 text-sm">Send to recent contacts</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SendPage