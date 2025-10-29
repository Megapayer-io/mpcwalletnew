import React, { useState } from 'react'
import { Plus, Search, Trash2, Zap } from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import toast from 'react-hot-toast'

const Tokens: React.FC = () => {
  const { customTokens, addCustomToken, removeCustomToken } = useWalletStore()
  const [showAddToken, setShowAddToken] = useState(false)
  const [formData, setFormData] = useState({
    address: '',
    name: '',
    symbol: '',
    decimals: '18'
  })
  const [loading, setLoading] = useState(false)

  const handleAddToken = async () => {
    if (!formData.address.trim() || !formData.name.trim() || !formData.symbol.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await addCustomToken({
        address: formData.address,
        name: formData.name,
        symbol: formData.symbol,
        decimals: parseInt(formData.decimals)
      })
      toast.success('Token added successfully!')
      setShowAddToken(false)
      setFormData({ address: '', name: '', symbol: '', decimals: '18' })
    } catch (error) {
      toast.error('Failed to add token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Token Management</h1>
                <p className="text-gray-600">Manage your custom tokens</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddToken(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Token
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tokens..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tokens List */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          {customTokens.length > 0 ? (
            <div className="space-y-4">
              {customTokens.map((token, index) => (
                <div key={token.address} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                      {token.symbol.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{token.symbol}</h3>
                      <p className="text-gray-600">{token.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{token.address.slice(0, 6)}...{token.address.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">0.0000</p>
                    <p className="text-gray-600">$0.00</p>
                    <button
                      onClick={() => removeCustomToken(token.address)}
                      className="mt-2 p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Custom Tokens</h3>
              <p className="text-gray-600 mb-6">Add custom tokens to track your portfolio</p>
              <button
                onClick={() => setShowAddToken(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Token
              </button>
            </div>
          )}
        </div>

        {/* Add Token Modal */}
        {showAddToken && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Custom Token</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Token Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Token Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Token Name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Token Symbol</label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder="SYMBOL"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Decimals</label>
                  <input
                    type="number"
                    value={formData.decimals}
                    onChange={(e) => setFormData({ ...formData, decimals: e.target.value })}
                    placeholder="18"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddToken(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddToken}
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Token'}
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

export default Tokens