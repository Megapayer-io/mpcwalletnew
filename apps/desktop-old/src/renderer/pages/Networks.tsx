import React, { useState } from 'react'
import { 
  Globe, 
  Plus, 
  Settings, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  ExternalLink,
  Copy,
  AlertCircle,
  Shield,
  Zap
} from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import toast from 'react-hot-toast'

const Networks: React.FC = () => {
  const { networks, currentNetwork, switchNetwork, addNetwork, removeNetwork } = useWalletStore()
  
  const [showAddNetwork, setShowAddNetwork] = useState(false)
  const [editingNetwork, setEditingNetwork] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    chainId: '',
    rpcUrl: '',
    blockExplorer: '',
    logoUrl: ''
  })
  const [loading, setLoading] = useState(false)

  const handleAddNetwork = async () => {
    if (!formData.name.trim() || !formData.symbol.trim() || !formData.chainId.trim() || !formData.rpcUrl.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const newNetwork = {
        id: formData.name.toLowerCase().replace(/\s+/g, '-'),
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        chainId: parseInt(formData.chainId),
        rpcUrl: formData.rpcUrl,
        blockExplorer: formData.blockExplorer || '',
        logoUrl: formData.logoUrl || ''
      }
      
      addNetwork(newNetwork)
      toast.success('Network added successfully!')
      setShowAddNetwork(false)
      setFormData({ name: '', symbol: '', chainId: '', rpcUrl: '', blockExplorer: '', logoUrl: '' })
    } catch (error) {
      toast.error('Failed to add network')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveNetwork = (networkId: string) => {
    if (networks.length <= 1) {
      toast.error('Cannot remove the last network')
      return
    }
    
    if (currentNetwork?.id === networkId) {
      toast.error('Cannot remove the currently active network')
      return
    }
    
    if (window.confirm('Are you sure you want to remove this network?')) {
      removeNetwork(networkId)
      toast.success('Network removed successfully!')
    }
  }

  const handleCopyRpcUrl = (rpcUrl: string) => {
    navigator.clipboard.writeText(rpcUrl)
    toast.success('RPC URL copied to clipboard!')
  }

  const handleTestConnection = async (rpcUrl: string) => {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1
        })
      })
      
      if (response.ok) {
        toast.success('Connection successful!')
      } else {
        toast.error('Connection failed')
      }
    } catch (error) {
      toast.error('Connection failed')
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Network Management</h1>
                <p className="text-gray-600">Manage your blockchain networks and connections</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddNetwork(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Network
            </button>
          </div>
        </div>

        {/* Current Network Status */}
        {currentNetwork && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Currently Active</h2>
                <p className="text-gray-600">Connected to {currentNetwork.name}</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {currentNetwork.symbol.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{currentNetwork.name}</h3>
                    <p className="text-gray-600 font-mono">{currentNetwork.symbol} • Chain ID: {currentNetwork.chainId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Connected
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Networks Grid */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Available Networks</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Secure RPC connections</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {networks.map((network) => (
              <div
                key={network.id}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                  currentNetwork?.id === network.id
                    ? 'bg-blue-50 border-blue-200 shadow-lg'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => switchNetwork(network.id)}
              >
                {/* Network Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTestConnection(network.rpcUrl)
                    }}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Test Connection"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyRpcUrl(network.rpcUrl)
                    }}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Copy RPC URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {networks.length > 1 && currentNetwork?.id !== network.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveNetwork(network.id)
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Remove Network"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${
                    currentNetwork?.id === network.id
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                      : 'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}>
                    {network.symbol.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{network.name}</h3>
                    <p className="text-gray-600">{network.symbol}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Chain ID:</span>
                    <span className="font-mono font-semibold">{network.chainId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">RPC:</span>
                    <span className="font-mono text-xs truncate max-w-32" title={network.rpcUrl}>
                      {network.rpcUrl.slice(0, 20)}...
                    </span>
                  </div>
                  {network.blockExplorer && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Explorer:</span>
                      <a 
                        href={network.blockExplorer} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </div>
                  )}
                </div>
                
                {currentNetwork?.id === network.id && (
                  <div className="mt-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium text-center">
                    Active
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Network Modal */}
        {showAddNetwork && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add Custom Network</h3>
                <button
                  onClick={() => setShowAddNetwork(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Network Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ethereum Mainnet"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Symbol *</label>
                    <input
                      type="text"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      placeholder="ETH"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Chain ID *</label>
                    <input
                      type="number"
                      value={formData.chainId}
                      onChange={(e) => setFormData({ ...formData, chainId: e.target.value })}
                      placeholder="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Logo URL</label>
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">RPC URL *</label>
                  <input
                    type="url"
                    value={formData.rpcUrl}
                    onChange={(e) => setFormData({ ...formData, rpcUrl: e.target.value })}
                    placeholder="https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Block Explorer URL</label>
                  <input
                    type="url"
                    value={formData.blockExplorer}
                    onChange={(e) => setFormData({ ...formData, blockExplorer: e.target.value })}
                    placeholder="https://etherscan.io"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Security Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-900">Security Notice</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Only add networks from trusted sources. Malicious RPC endpoints can compromise your wallet security.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddNetwork(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNetwork}
                    disabled={loading || !formData.name.trim() || !formData.symbol.trim() || !formData.chainId.trim() || !formData.rpcUrl.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Network'}
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

export default Networks