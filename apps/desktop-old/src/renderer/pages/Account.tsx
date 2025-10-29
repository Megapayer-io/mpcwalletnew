import React, { useState } from 'react'
import { 
  User, 
  Key, 
  Shield, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  Download,
  Upload,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import { EvmWallet } from '@mpcwallet/sdk'
import toast from 'react-hot-toast'

const Account: React.FC = () => {
  const { 
    currentAccount, 
    accounts, 
    createAccount, 
    importAccount, 
    importWalletFromMnemonic,
    exportPrivateKey,
    getSeedPhrase,
    switchAccount, 
    removeAccount,
    lock 
  } = useWalletStore()
  
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [showSeedPhrase, setShowSeedPhrase] = useState(false)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [showImportAccount, setShowImportAccount] = useState(false)
  const [importMethod, setImportMethod] = useState<'privateKey' | 'seedPhrase' | 'mnemonic'>('privateKey')
  const [formData, setFormData] = useState({
    name: '',
    privateKey: '',
    seedPhrase: '',
    mnemonic: ''
  })
  const [loading, setLoading] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [seedPhrase, setSeedPhrase] = useState('')

  // Get real private key and seed phrase
  const getRealPrivateKey = async () => {
    try {
      if (currentAccount?.address) {
        const key = exportPrivateKey(currentAccount.address)
        setPrivateKey(key)
      }
    } catch (error) {
      console.error('Failed to get private key:', error)
      toast.error('Failed to retrieve private key')
    }
  }

  const getRealSeedPhrase = async () => {
    try {
      const seedPhrase = getSeedPhrase()
      setSeedPhrase(seedPhrase)
    } catch (error) {
      console.error('Failed to get seed phrase:', error)
      toast.error('Failed to retrieve seed phrase')
    }
  }

  const handleCreateAccount = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter account name')
      return
    }

    setLoading(true)
    try {
      await createAccount(formData.name)
      toast.success('Account created successfully!')
      setShowCreateAccount(false)
      setFormData({ name: '', privateKey: '', seedPhrase: '', mnemonic: '' })
    } catch (error) {
      toast.error('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleImportAccount = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter account name')
      return
    }

    setLoading(true)
    try {
      if (importMethod === 'privateKey') {
        if (!formData.privateKey.trim()) {
          toast.error('Please enter private key')
          return
        }
        await importAccount(formData.privateKey, formData.name)
      } else if (importMethod === 'seedPhrase') {
        if (!formData.seedPhrase.trim()) {
          toast.error('Please enter seed phrase')
          return
        }
        // Note: This would need to be implemented in the store
        toast.error('Seed phrase import not yet implemented')
        return
      } else if (importMethod === 'mnemonic') {
        if (!formData.mnemonic.trim()) {
          toast.error('Please enter mnemonic')
          return
        }
        await importWalletFromMnemonic(formData.mnemonic)
      }
      
      toast.success('Account imported successfully!')
      setShowImportAccount(false)
      setFormData({ name: '', privateKey: '', seedPhrase: '', mnemonic: '' })
    } catch (error) {
      toast.error('Failed to import account')
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchAccount = (address: string) => {
    switchAccount(address)
    toast.success('Account switched successfully!')
  }

  const handleRemoveAccount = (address: string) => {
    if (accounts.length <= 1) {
      toast.error('Cannot remove the last account')
      return
    }
    removeAccount(address)
    toast.success('Account removed successfully!')
  }

  const handleLock = () => {
    lock()
    toast.success('Wallet locked successfully!')
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
              <p className="text-gray-600">Manage your wallet accounts and security</p>
            </div>
          </div>
        </div>

        {/* Current Account Info */}
        {currentAccount && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Account</h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {currentAccount.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{currentAccount.name}</h3>
                  <p className="text-gray-600 font-mono text-lg">
                    {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                  </p>
                  {currentAccount.isImported && (
                    <span className="inline-block px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-full mt-2">
                      Imported Account
                    </span>
                  )}
                </div>
              </div>

              {/* Security Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Private Key</h4>
                  <p className="text-gray-600 text-sm mb-3">View your private key (keep it secure)</p>
                  <button
                    onClick={async () => {
                      if (!showPrivateKey) {
                        await getRealPrivateKey()
                      }
                      setShowPrivateKey(!showPrivateKey)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPrivateKey ? 'Hide' : 'Show'} Private Key
                  </button>
                  {showPrivateKey && (
                    <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                      <p className="font-mono text-sm break-all">
                        {privateKey || 'Loading...'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-white/50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Seed Phrase</h4>
                  <p className="text-gray-600 text-sm mb-3">View your recovery phrase</p>
                  <button
                    onClick={async () => {
                      if (!showSeedPhrase) {
                        await getRealSeedPhrase()
                      }
                      setShowSeedPhrase(!showSeedPhrase)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    {showSeedPhrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showSeedPhrase ? 'Hide' : 'Show'} Seed Phrase
                  </button>
                  {showSeedPhrase && (
                    <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                      <p className="font-mono text-sm">
                        {seedPhrase || 'Loading...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Management */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Account Management</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateAccount(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Account
              </button>
              <button
                onClick={() => setShowImportAccount(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import Account
              </button>
            </div>
          </div>

          {/* Accounts List */}
          <div className="space-y-4">
            {accounts.map((account, index) => (
              <div
                key={account.address}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  currentAccount?.address === account.address
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                    currentAccount?.address === account.address
                      ? 'bg-blue-600'
                      : 'bg-gray-400'
                  }`}>
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.name}</h3>
                    <p className="text-gray-600 font-mono text-sm">
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </p>
                    {account.isImported && (
                      <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full mt-1">
                        Imported
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentAccount?.address !== account.address ? (
                    <button
                      onClick={() => handleSwitchAccount(account.address)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Switch
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                      Active
                    </span>
                  )}
                  {accounts.length > 1 && (
                    <button
                      onClick={() => handleRemoveAccount(account.address)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Actions */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Security</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={handleLock}
              className="flex items-center gap-4 p-6 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-red-900">Lock Wallet</h3>
                <p className="text-red-700 text-sm">Secure your wallet with PIN protection</p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-6 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-2xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-orange-900">Export Wallet</h3>
                <p className="text-orange-700 text-sm">Download wallet backup file</p>
              </div>
            </button>
          </div>
        </div>

        {/* Modals */}
        {showCreateAccount && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Account</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Account Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My New Account"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateAccount(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAccount}
                    disabled={loading || !formData.name.trim()}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showImportAccount && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Import Account</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Account Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Imported Account"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Import Method Selection */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Import Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setImportMethod('privateKey')}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        importMethod === 'privateKey'
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      Private Key
                    </button>
                    <button
                      onClick={() => setImportMethod('seedPhrase')}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        importMethod === 'seedPhrase'
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      Seed Phrase
                    </button>
                    <button
                      onClick={() => setImportMethod('mnemonic')}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        importMethod === 'mnemonic'
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      Mnemonic
                    </button>
                  </div>
                </div>

                {/* Dynamic Input Based on Method */}
                {importMethod === 'privateKey' && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Private Key</label>
                    <input
                      type="password"
                      value={formData.privateKey}
                      onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                      placeholder="0x..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {importMethod === 'seedPhrase' && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Seed Phrase</label>
                    <textarea
                      value={formData.seedPhrase}
                      onChange={(e) => setFormData({ ...formData, seedPhrase: e.target.value })}
                      placeholder="abandon abandon abandon..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {importMethod === 'mnemonic' && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Mnemonic</label>
                    <textarea
                      value={formData.mnemonic}
                      onChange={(e) => setFormData({ ...formData, mnemonic: e.target.value })}
                      placeholder="abandon abandon abandon..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowImportAccount(false)
                      setFormData({ name: '', privateKey: '', seedPhrase: '', mnemonic: '' })
                    }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportAccount}
                    disabled={loading || !formData.name.trim() || 
                      (importMethod === 'privateKey' && !formData.privateKey.trim()) ||
                      (importMethod === 'seedPhrase' && !formData.seedPhrase.trim()) ||
                      (importMethod === 'mnemonic' && !formData.mnemonic.trim())
                    }
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Importing...' : 'Import'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Account