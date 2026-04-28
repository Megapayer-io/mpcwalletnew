'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { useWalletStore } from '@/store/wallet'
import { useP2PStore } from '@/store/p2p'
import { CustomIcons } from '@/components/icons/CustomIcons'
import Link from 'next/link'

export default function TradesPage() {
  const router = useRouter()
  const { address, isUnlocked } = useWalletStore()
  const {
    authToken,
    trades,
    isLoadingTrades,
    fetchTrades,
    login,
    setTradesFilters,
    tradesFilters,
  } = useP2PStore()

  useEffect(() => {
    if (!isUnlocked || !address) {
      router.push('/unlock')
      return
    }

    if (!authToken && address) {
      login(address).catch(console.error)
    }
  }, [isUnlocked, address, authToken, login, router])

  useEffect(() => {
    if (authToken) {
      fetchTrades()
    }
  }, [authToken, fetchTrades])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-megapayer-emerald/20 text-megapayer-emerald'
      case 'cancelled':
      case 'disputed':
        return 'bg-megapayer-accent/20 text-megapayer-accent'
      default:
        return 'bg-megapayer-teal/20 text-megapayer-teal'
    }
  }

  return (
    <Layout title="My Trades" subtitle="Track your P2P trading activity">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-megapayer-text font-heading">My Trades</h2>
            <p className="text-megapayer-muted mt-1">View and manage your active trades</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTradesFilters({ status: 'all' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                tradesFilters.status === 'all' || !tradesFilters.status
                  ? 'bg-gradient-to-r from-megapayer-teal to-megapayer-violet text-white'
                  : 'bg-megapayer-panel-soft text-megapayer-text'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTradesFilters({ status: 'pending' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                tradesFilters.status === 'pending'
                  ? 'bg-gradient-to-r from-megapayer-teal to-megapayer-violet text-white'
                  : 'bg-megapayer-panel-soft text-megapayer-text'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setTradesFilters({ status: 'completed' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                tradesFilters.status === 'completed'
                  ? 'bg-gradient-to-r from-megapayer-teal to-megapayer-violet text-white'
                  : 'bg-megapayer-panel-soft text-megapayer-text'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Trades List */}
        {isLoadingTrades ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal mx-auto mb-4"></div>
            <p className="text-megapayer-muted">Loading trades...</p>
          </div>
        ) : trades.length > 0 ? (
          <div className="space-y-4">
            {trades.map((trade) => (
              <Link
                key={trade.id}
                href={`/p2p/trades/${trade.id}`}
                className="block megapayer-panel p-6 animate-fade-in-up hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-megapayer-teal/20 to-megapayer-violet/20 rounded-xl flex items-center justify-center">
                      <CustomIcons.ArrowLeftRight className="w-6 h-6 text-megapayer-teal" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-megapayer-text">
                          {trade.tokenSymbol} Trade #{trade.id.slice(0, 8)}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(trade.status)}`}>
                          {trade.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-megapayer-muted">
                        {trade.amount} {trade.tokenSymbol} • ${trade.totalPrice} {trade.fiatCurrency}
                      </p>
                      <p className="text-xs text-megapayer-muted mt-1">
                        {trade.buyer?.walletAddress === address
                          ? `Seller: ${trade.seller?.username || `${trade.seller?.walletAddress.slice(0, 6)}...${trade.seller?.walletAddress.slice(-4)}`}`
                          : `Buyer: ${trade.buyer?.username || `${trade.buyer?.walletAddress.slice(0, 6)}...${trade.buyer?.walletAddress.slice(-4)}`}`}
                      </p>
                    </div>
                  </div>
                  <CustomIcons.ChevronRight className="w-5 h-5 text-megapayer-muted" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 megapayer-panel">
            <div className="w-20 h-20 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CustomIcons.ArrowLeftRight className="w-10 h-10 text-megapayer-muted" />
            </div>
            <h4 className="text-xl font-bold text-megapayer-text mb-3">No Trades</h4>
            <p className="text-megapayer-muted mb-6">Start trading by accepting an order!</p>
            <Link
              href="/p2p"
              className="inline-flex items-center gap-2 px-6 py-3 megapayer-btn-primary rounded-xl"
            >
              Browse Orders
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}

