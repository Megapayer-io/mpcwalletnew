'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { useWalletStore } from '@/store/wallet'
import { useP2PStore } from '@/store/p2p'
import { CustomIcons } from '@/components/icons/CustomIcons'
import { CreateOrderModal } from '@/components/p2p/CreateOrderModal'
import Link from 'next/link'

export default function P2PDashboard() {
  const router = useRouter()
  const { address, isUnlocked, currentNetwork, balance } = useWalletStore()
  const {
    authToken,
    user,
    orders,
    trades,
    isLoadingOrders,
    isLoadingTrades,
    ordersFilters,
    setOrdersFilters,
    setShowCreateOrderModal,
    showCreateOrderModal,
    setCurrentView,
    login,
    fetchOrders,
    fetchTrades,
  } = useP2PStore()

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'buy' | 'sell'>('all')

  useEffect(() => {
    if (!isUnlocked || !address) {
      router.push('/unlock')
      return
    }

    // Auto-login to P2P when wallet is unlocked
    if (!authToken && address) {
      login(address).catch(console.error)
    }
  }, [isUnlocked, address, authToken, login, router])

  useEffect(() => {
    if (authToken) {
      fetchOrders()
      fetchTrades()
    }
  }, [authToken, fetchOrders, fetchTrades])

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === 'all') return true
    return order.type === selectedFilter
  })

  const activeTrades = trades.filter((trade) =>
    ['pending', 'escrow_locked', 'payment_pending', 'payment_confirmed'].includes(trade.status)
  )

  return (
    <Layout title="P2P Exchange" subtitle="Trade cryptocurrency peer-to-peer">
      <div className="space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="megapayer-panel p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-emerald/20 to-megapayer-teal/20 rounded-xl flex items-center justify-center">
                <CustomIcons.TrendingUp className="w-6 h-6 text-megapayer-emerald" />
              </div>
            </div>
            <p className="text-sm text-megapayer-muted mb-1">Active Orders</p>
            <p className="text-2xl font-bold text-megapayer-text">{orders.length}</p>
          </div>

          <div className="megapayer-panel p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-violet/20 to-megapayer-accent/20 rounded-xl flex items-center justify-center">
                <CustomIcons.ArrowLeftRight className="w-6 h-6 text-megapayer-violet" />
              </div>
            </div>
            <p className="text-sm text-megapayer-muted mb-1">Active Trades</p>
            <p className="text-2xl font-bold text-megapayer-text">{activeTrades.length}</p>
          </div>

          <div className="megapayer-panel p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-teal/20 to-megapayer-violet/20 rounded-xl flex items-center justify-center">
                <CustomIcons.Wallet className="w-6 h-6 text-megapayer-teal" />
              </div>
            </div>
            <p className="text-sm text-megapayer-muted mb-1">Balance</p>
            <p className="text-2xl font-bold text-megapayer-text">
              {balance ? parseFloat(balance).toFixed(4) : '0.0000'} {currentNetwork?.symbol || 'ETH'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="megapayer-panel p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-megapayer-text font-heading">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setShowCreateOrderModal(true)}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-megapayer-emerald/10 to-megapayer-teal/10 rounded-xl hover:from-megapayer-emerald/20 hover:to-megapayer-teal/20 transition-all duration-300 hover:scale-105 border border-megapayer-border"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-megapayer-emerald to-megapayer-teal rounded-lg flex items-center justify-center">
                <CustomIcons.Plus className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-megapayer-text">Create Order</p>
                <p className="text-xs text-megapayer-muted">Buy or sell crypto</p>
              </div>
            </button>

            <Link
              href="/p2p/my-orders"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-megapayer-violet/10 to-megapayer-accent/10 rounded-xl hover:from-megapayer-violet/20 hover:to-megapayer-accent/20 transition-all duration-300 hover:scale-105 border border-megapayer-border"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-megapayer-violet to-megapayer-accent rounded-lg flex items-center justify-center">
                <CustomIcons.History className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-megapayer-text">My Orders</p>
                <p className="text-xs text-megapayer-muted">View your orders</p>
              </div>
            </Link>

            <Link
              href="/p2p/trades"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-megapayer-teal/10 to-megapayer-violet/10 rounded-xl hover:from-megapayer-teal/20 hover:to-megapayer-violet/20 transition-all duration-300 hover:scale-105 border border-megapayer-border"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-megapayer-teal to-megapayer-violet rounded-lg flex items-center justify-center">
                <CustomIcons.ArrowLeftRight className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-megapayer-text">My Trades</p>
                <p className="text-xs text-megapayer-muted">Active trades</p>
              </div>
            </Link>

            <Link
              href="/p2p/payment-methods"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-megapayer-accent/10 to-megapayer-emerald/10 rounded-xl hover:from-megapayer-accent/20 hover:to-megapayer-emerald/20 transition-all duration-300 hover:scale-105 border border-megapayer-border"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-megapayer-accent to-megapayer-emerald rounded-lg flex items-center justify-center">
                <CustomIcons.Settings className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-megapayer-text">Payment Methods</p>
                <p className="text-xs text-megapayer-muted">Manage payments</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Admin Link (if admin) */}
        {user?.isAdmin && (
          <div className="megapayer-panel p-6 animate-fade-in-up">
            <Link
              href="/p2p/admin"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-megapayer-accent/10 to-megapayer-violet/10 rounded-xl hover:from-megapayer-accent/20 hover:to-megapayer-violet/20 transition-all duration-300 hover:scale-105 border border-megapayer-border"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-megapayer-accent to-megapayer-violet rounded-lg flex items-center justify-center">
                <CustomIcons.Shield className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-megapayer-text">Admin Panel</p>
                <p className="text-xs text-megapayer-muted">Manage platform</p>
              </div>
              <CustomIcons.ChevronRight className="w-5 h-5 text-megapayer-muted" />
            </Link>
          </div>
        )}

        {/* Orders List */}
        <div className="megapayer-panel p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-megapayer-text font-heading">Available Orders</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedFilter === 'all'
                    ? 'bg-gradient-to-r from-megapayer-teal to-megapayer-violet text-white'
                    : 'bg-megapayer-panel-soft text-megapayer-text hover:bg-megapayer-panel'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter('buy')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedFilter === 'buy'
                    ? 'bg-gradient-to-r from-megapayer-emerald to-megapayer-teal text-white'
                    : 'bg-megapayer-panel-soft text-megapayer-text hover:bg-megapayer-panel'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSelectedFilter('sell')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedFilter === 'sell'
                    ? 'bg-gradient-to-r from-megapayer-accent to-megapayer-violet text-white'
                    : 'bg-megapayer-panel-soft text-megapayer-text hover:bg-megapayer-panel'
                }`}
              >
                Sell
              </button>
            </div>
          </div>

          {isLoadingOrders ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal mx-auto mb-4"></div>
              <p className="text-megapayer-muted">Loading orders...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 bg-megapayer-panel-soft rounded-xl border border-megapayer-border hover:border-megapayer-teal/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
                  onClick={() => router.push(`/p2p/orders/${order.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          order.type === 'buy'
                            ? 'bg-gradient-to-br from-megapayer-emerald/20 to-megapayer-teal/20'
                            : 'bg-gradient-to-br from-megapayer-accent/20 to-megapayer-violet/20'
                        }`}
                      >
                        {order.type === 'buy' ? (
                          <CustomIcons.Download className="w-6 h-6 text-megapayer-emerald" />
                        ) : (
                          <CustomIcons.Send className="w-6 h-6 text-megapayer-accent" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-megapayer-text">{order.tokenSymbol}</h4>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              order.type === 'buy'
                                ? 'bg-megapayer-emerald/20 text-megapayer-emerald'
                                : 'bg-megapayer-accent/20 text-megapayer-accent'
                            }`}
                          >
                            {order.type === 'buy' ? 'BUY' : 'SELL'}
                          </span>
                        </div>
                        <p className="text-sm text-megapayer-muted">
                          {order.amount} {order.tokenSymbol} @ ${order.pricePerUnit}/{order.tokenSymbol}
                        </p>
                        {order.user && (
                          <p className="text-xs text-megapayer-muted mt-1">
                            {order.user.username || `${order.user.walletAddress.slice(0, 6)}...${order.user.walletAddress.slice(-4)}`}
                            {' • '}
                            {order.user.reputationScore.toFixed(1)}⭐ {' • '}
                            {order.user.completedTrades} trades
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-megapayer-text text-lg">
                        ${order.totalPrice} {order.fiatCurrency}
                      </p>
                      <p className="text-sm text-megapayer-muted">Total</p>
                      {order.user?.isVerified && (
                        <span className="inline-block mt-2 px-2 py-1 bg-megapayer-emerald/20 text-megapayer-emerald text-xs rounded">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CustomIcons.Search className="w-10 h-10 text-megapayer-muted" />
              </div>
              <h4 className="text-xl font-bold text-megapayer-text mb-3">No Orders Found</h4>
              <p className="text-megapayer-muted mb-6">Be the first to create an order!</p>
              <button
                onClick={() => setShowCreateOrderModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 megapayer-btn-primary rounded-xl"
              >
                <CustomIcons.Plus className="w-5 h-5" />
                Create Order
              </button>
            </div>
          )}
        </div>

        {/* Active Trades */}
        {activeTrades.length > 0 && (
          <div className="megapayer-panel p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-megapayer-text font-heading">Active Trades</h3>
              <Link
                href="/p2p/trades"
                className="text-sm text-megapayer-teal hover:text-megapayer-teal/80 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {activeTrades.slice(0, 3).map((trade) => (
                <Link
                  key={trade.id}
                  href={`/p2p/trades/${trade.id}`}
                  className="block p-4 bg-megapayer-panel-soft rounded-xl border border-megapayer-border hover:border-megapayer-teal/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-megapayer-text">
                        {trade.tokenSymbol} Trade #{trade.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-megapayer-muted">
                        {trade.amount} {trade.tokenSymbol} • Status: {trade.status.replace('_', ' ')}
                      </p>
                    </div>
                    <CustomIcons.ChevronRight className="w-5 h-5 text-megapayer-muted" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={showCreateOrderModal}
        onClose={() => setShowCreateOrderModal(false)}
      />
    </Layout>
  )
}

