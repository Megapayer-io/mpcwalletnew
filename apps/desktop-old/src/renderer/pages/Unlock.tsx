import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Wallet, 
  Eye, 
  EyeOff, 
  Shield, 
  AlertCircle,
  Lock,
  Key,
  RotateCcw,
  Trash2
} from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import toast from 'react-hot-toast'

const Unlock: React.FC = () => {
  const navigate = useNavigate()
  const { unlock, currentAccount, logout } = useWalletStore()
  
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!pin.trim()) {
      toast.error('Please enter your PIN')
      return
    }

    setLoading(true)
    try {
      const success = await unlock(pin)
      if (success) {
        toast.success('Wallet unlocked successfully!')
        navigate('/')
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        
        if (newAttempts >= 3) {
          setIsLocked(true)
          toast.error('Too many failed attempts. Please wait before trying again.')
        } else {
          toast.error(`Invalid PIN. ${3 - newAttempts} attempts remaining.`)
        }
        setPin('')
      }
    } catch (error) {
      toast.error('Failed to unlock wallet')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPin = () => {
    toast.error('PIN recovery not available. Please restore from backup.')
  }

  const handleResetWallet = () => {
    if (window.confirm('Are you sure you want to reset your wallet? This will delete all wallet data and you will need to set up a new wallet. This action cannot be undone.')) {
      if (window.confirm('This will permanently delete your wallet. Are you absolutely sure?')) {
        logout()
        toast.success('Wallet reset successfully. Please set up a new wallet.')
        navigate('/setup')
      }
    }
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Wallet Locked</h1>
            <p className="text-red-200 text-lg">Too many failed attempts</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Security Lock Activated</h2>
              <p className="text-red-200 mb-6">
                Your wallet has been temporarily locked due to multiple failed unlock attempts.
              </p>
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-6">
                <h3 className="text-red-200 font-semibold mb-2">Recovery Options:</h3>
                <ul className="text-red-100 text-sm space-y-1 text-left">
                  <li>• Restore from your seed phrase backup</li>
                  <li>• Import using your private key</li>
                  <li>• Contact support if you have a backup file</li>
                </ul>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsLocked(false)
                    setAttempts(0)
                    setPin('')
                  }}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
                >
                  Try Again
                </button>
                <button
                  onClick={handleResetWallet}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl hover:from-red-700 hover:to-red-900 transition-all duration-300 hover:scale-105 shadow-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Reset Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome Back</h1>
          <p className="text-blue-200 text-lg">Enter your PIN to unlock your wallet</p>
        </div>

        {/* Account Info */}
        {currentAccount && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {currentAccount.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-white font-semibold">{currentAccount.name}</h3>
                <p className="text-blue-200 text-sm font-mono">
                  {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Unlock Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={handleUnlock} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">Enter PIN</label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                  className="w-full px-4 py-4 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                >
                  {showPin ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-300 mt-0.5" />
                <div>
                  <h4 className="text-blue-200 font-semibold mb-1">Security Notice</h4>
                  <p className="text-blue-100 text-sm">
                    Your wallet is encrypted and secure. Only you can unlock it with your PIN.
                  </p>
                </div>
              </div>
            </div>

            {/* Attempts Warning */}
            {attempts > 0 && attempts < 3 && (
              <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-300 mt-0.5" />
                  <div>
                    <h4 className="text-orange-200 font-semibold mb-1">Invalid PIN</h4>
                    <p className="text-orange-100 text-sm">
                      {3 - attempts} attempts remaining before wallet locks.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !pin.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Unlocking...' : 'Unlock Wallet'}
            </button>
          </form>

          {/* Footer Actions */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleForgotPin}
                className="text-blue-300 hover:text-blue-200 transition-colors text-sm"
              >
                Forgot PIN?
              </button>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Key className="w-4 h-4" />
                <span>Secure Access</span>
              </div>
            </div>
            <button
              onClick={handleResetWallet}
              className="w-full py-2 bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-500/30 text-red-300 rounded-xl hover:from-red-600/30 hover:to-red-800/30 transition-all duration-300 hover:scale-105 font-semibold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Wallet
            </button>
          </div>
        </div>

        {/* Security Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <p className="text-blue-200 text-sm">Encrypted</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <p className="text-blue-200 text-sm">Secure</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <p className="text-blue-200 text-sm">Private</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Unlock