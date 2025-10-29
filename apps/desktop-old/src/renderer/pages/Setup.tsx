import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Wallet, 
  Key, 
  Shield, 
  CheckCircle, 
  Eye, 
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Lock,
  User
} from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import toast from 'react-hot-toast'

const Setup: React.FC = () => {
  const navigate = useNavigate()
  const { createWallet, importWallet, importFromSeed } = useWalletStore()
  
  const [step, setStep] = useState<'welcome' | 'create' | 'import' | 'import-seed'>('welcome')
  const [formData, setFormData] = useState({
    name: '',
    pin: '',
    confirmPin: '',
    privateKey: '',
    seedPhrase: ''
  })
  const [showPin, setShowPin] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCreateWallet = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a wallet name')
      return
    }
    if (!formData.pin.trim()) {
      toast.error('Please enter a PIN')
      return
    }
    if (formData.pin !== formData.confirmPin) {
      toast.error('PINs do not match')
      return
    }
    if (formData.pin.length < 4) {
      toast.error('PIN must be at least 4 characters')
      return
    }

    setLoading(true)
    try {
      await createWallet(formData.name, formData.pin)
      toast.success('Wallet created successfully!')
      navigate('/')
    } catch (error) {
      toast.error('Failed to create wallet')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleImportWallet = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a wallet name')
      return
    }
    if (!formData.privateKey.trim()) {
      toast.error('Please enter a private key')
      return
    }
    if (!formData.pin.trim()) {
      toast.error('Please enter a PIN')
      return
    }
    if (formData.pin !== formData.confirmPin) {
      toast.error('PINs do not match')
      return
    }

    setLoading(true)
    try {
      await importWallet(formData.privateKey, formData.name, formData.pin)
      toast.success('Wallet imported successfully!')
      navigate('/')
    } catch (error) {
      toast.error('Failed to import wallet')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleImportFromSeed = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a wallet name')
      return
    }
    if (!formData.seedPhrase.trim()) {
      toast.error('Please enter a seed phrase')
      return
    }
    if (!formData.pin.trim()) {
      toast.error('Please enter a PIN')
      return
    }
    if (formData.pin !== formData.confirmPin) {
      toast.error('PINs do not match')
      return
    }

    setLoading(true)
    try {
      await importFromSeed(formData.seedPhrase, formData.name, formData.pin)
      toast.success('Wallet imported successfully!')
      navigate('/')
    } catch (error) {
      toast.error('Failed to import wallet')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      pin: '',
      confirmPin: '',
      privateKey: '',
      seedPhrase: ''
    })
    setShowPin(false)
    setShowPrivateKey(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-2 h-2 text-yellow-800" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to MPC Wallet</h1>
          <p className="text-blue-200 text-sm">Your secure Web3 desktop wallet</p>
        </div>

        {/* Setup Options */}
        {step === 'welcome' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-4 animate-fadeIn w-full">
            <h2 className="text-lg font-bold text-white mb-4 text-center">Get Started</h2>
            <div className="space-y-2">
              <button
                onClick={() => setStep('create')}
                className="w-full flex items-center gap-2 p-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white rounded-lg hover:from-blue-500/30 hover:to-purple-600/30 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20"
              >
                <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm">Create New Wallet</h3>
                  <p className="text-blue-200 text-xs">Generate a new secure wallet</p>
                </div>
              </button>

              <button
                onClick={() => setStep('import')}
                className="w-full flex items-center gap-2 p-3 bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-white rounded-lg hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20"
              >
                <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm">Import Wallet</h3>
                  <p className="text-green-200 text-xs">Import using private key</p>
                </div>
              </button>

              <button
                onClick={() => setStep('import-seed')}
                className="w-full flex items-center gap-2 p-3 bg-gradient-to-r from-orange-500/20 to-red-600/20 text-white rounded-lg hover:from-orange-500/30 hover:to-red-600/30 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20"
              >
                <div className="w-8 h-8 bg-orange-500/30 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm">Import from Seed</h3>
                  <p className="text-orange-200 text-xs">Import using seed phrase</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Create Wallet Form */}
        {step === 'create' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-4 animate-slideIn w-full">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setStep('welcome')}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500/30 rounded-lg flex items-center justify-center">
                  <Wallet className="w-3 h-3 text-blue-300" />
                </div>
                <h2 className="text-base font-bold text-white">Create New Wallet</h2>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-white/90 font-medium mb-1 text-xs">Wallet Name</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/50" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Wallet"
                    className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-1 text-xs">PIN (4+ characters)</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/50" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    placeholder="Enter your PIN"
                    className="w-full pl-8 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                  />
                  <button
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-1 text-xs">Confirm PIN</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/50" />
                  <input
                    type="password"
                    value={formData.confirmPin}
                    onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value })}
                    placeholder="Confirm your PIN"
                    className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-2">
                <div className="flex items-start gap-1.5">
                  <Shield className="w-3 h-3 text-blue-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-200 font-medium text-xs mb-0.5">Security Notice</h4>
                    <p className="text-blue-100/80 text-xs">
                      Your wallet will be encrypted with your PIN. Make sure to backup your seed phrase securely.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateWallet}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Wallet...
                  </div>
                ) : (
                  'Create Wallet'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Import Wallet Form */}
        {step === 'import' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-4 animate-slideIn w-full">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setStep('welcome')}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500/30 rounded-lg flex items-center justify-center">
                  <Key className="w-3 h-3 text-green-300" />
                </div>
                <h2 className="text-base font-bold text-white">Import Wallet</h2>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-white/90 font-medium mb-1 text-xs">Wallet Name</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/50" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Imported Wallet"
                    className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-1 text-xs">Private Key</label>
                <div className="relative">
                  <Key className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/50" />
                  <input
                    type={showPrivateKey ? 'text' : 'password'}
                    value={formData.privateKey}
                    onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                    placeholder="0x..."
                    className="w-full pl-8 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all text-sm"
                  />
                  <button
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPrivateKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-1 text-xs">PIN (4+ characters)</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/50" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    placeholder="Enter your PIN"
                    className="w-full pl-8 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all text-sm"
                  />
                  <button
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-1 text-xs">Confirm PIN</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/50" />
                  <input
                    type="password"
                    value={formData.confirmPin}
                    onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value })}
                    placeholder="Confirm your PIN"
                    className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-400/20 rounded-lg p-2">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-3 h-3 text-orange-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-orange-200 font-medium text-xs mb-0.5">Security Warning</h4>
                    <p className="text-orange-100/80 text-xs">
                      Never share your private key with anyone. MPC Wallet will encrypt it with your PIN.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleImportWallet}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Importing Wallet...
                  </div>
                ) : (
                  'Import Wallet'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Import from Seed Form */}
        {step === 'import-seed' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-4 animate-slideIn w-full">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setStep('welcome')}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500/30 rounded-lg flex items-center justify-center">
                  <Shield className="w-3 h-3 text-orange-300" />
                </div>
                <h2 className="text-base font-bold text-white">Import from Seed</h2>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-white/90 font-medium mb-1 text-xs">Wallet Name</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/50" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Imported Wallet"
                    className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-1 text-xs">Seed Phrase</label>
                <div className="relative">
                  <Shield className="absolute left-2.5 top-2.5 w-3 h-3 text-white/50" />
                  <textarea
                    value={formData.seedPhrase}
                    onChange={(e) => setFormData({ ...formData, seedPhrase: e.target.value })}
                    placeholder="Enter your 12 or 24 word seed phrase..."
                    rows={2}
                    className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all resize-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-1 text-xs">PIN (4+ characters)</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/50" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    placeholder="Enter your PIN"
                    className="w-full pl-8 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-sm"
                  />
                  <button
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-1 text-xs">Confirm PIN</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/50" />
                  <input
                    type="password"
                    value={formData.confirmPin}
                    onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value })}
                    placeholder="Confirm your PIN"
                    className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-2">
                <div className="flex items-start gap-1.5">
                  <CheckCircle className="w-3 h-3 text-green-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-green-200 font-medium text-xs mb-0.5">Secure Import</h4>
                    <p className="text-green-100/80 text-xs">
                      Your seed phrase will be encrypted with your PIN and stored securely.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleImportFromSeed}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 hover:scale-105 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Importing Wallet...
                  </div>
                ) : (
                  'Import Wallet'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Setup