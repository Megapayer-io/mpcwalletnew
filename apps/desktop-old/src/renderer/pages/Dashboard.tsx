import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Send, 
  Download, 
  Plus, 
  TrendingUp, 
  PieChart,
  Wallet,
  Activity,
  Zap,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  RefreshCw
} from 'lucide-react'
import { useWalletStore } from '../store/walletStore'

const Dashboard: React.FC = () => {
  const { 
    currentAccount, 
    balance, 
    usdBalance, 
    currentNetwork, 
    customTokens,
    networks,
    transactions,
    refreshBalance,
    fetchTransactions
  } = useWalletStore()
  
  const [showBalance, setShowBalance] = useState(true)
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const hasRefreshed = useRef(false)

  useEffect(() => {
    if (!hasRefreshed.current && currentAccount && currentNetwork) {
      loadRealData()
      hasRefreshed.current = true
    }
  }, [currentAccount, currentNetwork]) // Run when account or network changes

  useEffect(() => {
    // Calculate real portfolio value
    const nativeValue = parseFloat(usdBalance) || 0
    setPortfolioValue(nativeValue)
  }, [usdBalance])

  const loadRealData = async () => {
    if (!currentAccount || !currentNetwork) return
    
    try {
      setIsRefreshing(true)
      // Load real balance
      await refreshBalance()
      // Load real transactions
      await fetchTransactions()
    } catch (error) {
      console.error('Failed to load real data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Real stats based on actual wallet data
  const stats = [
    {
      name: 'Total Portfolio',
      value: `$${portfolioValue.toFixed(2)}`,
      change: balance ? `${parseFloat(balance).toFixed(4)} ${currentNetwork?.symbol || 'ETH'}` : '0.0000 ETH',
      changeType: 'positive' as const,
      icon: PieChart,
      color: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Balance',
      value: balance ? `${parseFloat(balance).toFixed(4)} ${currentNetwork?.symbol || 'ETH'}` : '0.0000 ETH',
      change: usdBalance ? `≈ $${usdBalance}` : '≈ $0.00',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Active Networks',
      value: networks.length.toString(),
      change: networks.map(n => n.name).join(', ') || 'No networks',
      changeType: 'neutral' as const,
      icon: Wallet,
      color: 'from-orange-500 to-red-600'
    },
    {
      name: 'Transactions',
      value: transactions.length.toString(),
      change: transactions.length > 0 ? 'Total transactions' : 'No transactions yet',
      changeType: 'neutral' as const,
      icon: Activity,
      color: 'from-purple-500 to-pink-600'
    }
  ]

  // Real transactions from blockchain
  const recentTransactions = transactions.slice(0, 5).map((tx) => ({
    id: tx.hash,
    type: tx.type,
    amount: `${parseFloat(tx.value).toFixed(4)} ${tx.tokenSymbol || currentNetwork?.symbol || 'ETH'}`,
    to: tx.to,
    from: tx.from,
    time: new Date(tx.timestamp).toLocaleString(),
    status: tx.status,
    value: `$${parseFloat(tx.value).toFixed(2)}`
  }))

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {currentAccount?.name || 'User'}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Your secure Web3 wallet is ready for action
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadRealData}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="font-medium">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                <span className="font-medium">{showBalance ? 'Hide' : 'Show'} Balance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.name}
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.changeType === 'positive' && (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600 font-medium">{stat.name}</p>
                <p className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stat.change}
                </p>
              </div>
            )
          })}
        </div>

        {/* Action Bar */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <div className="flex gap-4">
              <Link
                to="/send"
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Send className="w-5 h-5" />
                <span className="font-semibold">Send</span>
              </Link>
              <Link
                to="/receive"
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span className="font-semibold">Receive</span>
              </Link>
              <Link
                to="/tokens"
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Add Token</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portfolio Section */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Portfolio</h3>
                  <p className="text-gray-600">Your token holdings and balances</p>
                </div>
              </div>
              <Link
                to="/tokens"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Add Token</span>
              </Link>
            </div>
            
            <div className="space-y-4">
              {/* Native Token */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {currentNetwork?.symbol?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{currentNetwork?.symbol || 'ETH'}</h4>
                    <p className="text-gray-600">{currentNetwork?.name || 'Ethereum'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-lg">
                    {showBalance ? balance : '••••••'} {currentNetwork?.symbol || 'ETH'}
                  </p>
                  <p className="text-gray-600">
                    {showBalance ? `≈ $${usdBalance}` : '••••••'}
                  </p>
                </div>
              </div>

              {/* Custom Tokens */}
              {customTokens.length > 0 ? (
                customTokens.map((token) => (
                  <div key={token.address} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{token.symbol}</h4>
                        <p className="text-gray-600">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">
                        {showBalance ? '0.0000' : '••••••'}
                      </p>
                      <p className="text-gray-600">
                        {showBalance ? '$0.00' : '••••••'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">No Custom Tokens</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">Add custom tokens to track your complete portfolio and get a comprehensive view of your holdings.</p>
                  <Link
                    to="/tokens"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Token
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
                <p className="text-gray-600">Your latest transactions</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {tx.type === 'send' ? (
                          <ArrowUpRight className="w-6 h-6 text-red-600" />
                        ) : (
                          <ArrowDownLeft className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{tx.amount}</p>
                        <p className="text-sm text-gray-600">
                          {tx.type === 'send' ? 'To' : 'From'} {tx.type === 'send' ? tx.to : tx.from}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{tx.value}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {tx.time}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">No Transactions Yet</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">Your transaction history will appear here once you start using your wallet.</p>
                </div>
              )}
              
              {recentTransactions.length > 0 && (
                <Link
                  to="/history"
                  className="block w-full text-center py-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold text-gray-700"
                >
                  View All Transactions
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard