'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { useWalletStore } from '@/store/wallet'
import { useP2PStore } from '@/store/p2p'
import { CustomIcons } from '@/components/icons/CustomIcons'
import Link from 'next/link'

export default function MyOrdersPage() {
  const router = useRouter()
  const { address, isUnlocked } = useWalletStore()
  const {
    authToken,
    myOrders,
    isLoadingOrders,
    fetchMyOrders,
    cancelOrder,
    updateOrder,
    login,
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
      fetchMyOrders()
    }
  }, [authToken, fetchMyOrders])

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      await cancelOrder(orderId)
    }
  }

  const handleToggleOrderStatus = async (orderId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    await updateOrder(orderId, { status: newStatus })
  }

  return (
    <Layout title="My Orders" subtitle="Manage your P2P orders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-megapayer-text font-heading">My Orders</h2>
            <p className="text-megapayer-muted mt-1">Manage and track your buy/sell orders</p>
          </div>
          <Link
            href="/p2p"
            className="px-6 py-3 megapayer-btn-primary rounded-xl font-semibold"
          >
            <CustomIcons.Plus className="w-5 h-5 inline mr-2" />
            Create Order
          </Link>
        </div>

        {/* Orders List */}
        {isLoadingOrders ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal mx-auto mb-4"></div>
            <p className="text-megapayer-muted">Loading orders...</p>
          </div>
        ) : myOrders.length > 0 ? (
          <div className="space-y-4">
            {myOrders.map((order) => (
              <div
                key={order.id}
                className="megapayer-panel p-6 animate-fade-in-up"
              >
                <div className="flex items-center justify-between mb-4">
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
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            order.status === 'active'
                              ? 'bg-megapayer-emerald/20 text-megapayer-emerald'
                              : order.status === 'paused'
                              ? 'bg-megapayer-accent/20 text-megapayer-accent'
                              : 'bg-megapayer-muted/20 text-megapayer-muted'
                          }`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-megapayer-muted">
                        {order.amount} {order.tokenSymbol} @ ${order.pricePerUnit}/{order.tokenSymbol}
                      </p>
                      <p className="text-xs text-megapayer-muted mt-1">
                        Total: ${order.totalPrice} {order.fiatCurrency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === 'active' || order.status === 'paused' ? (
                      <>
                        <button
                          onClick={() => handleToggleOrderStatus(order.id, order.status)}
                          className="px-4 py-2 bg-megapayer-panel-soft text-megapayer-text rounded-lg hover:bg-megapayer-panel transition-all duration-300 text-sm font-medium"
                        >
                          {order.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-4 py-2 bg-megapayer-accent/20 text-megapayer-accent rounded-lg hover:bg-megapayer-accent/30 transition-all duration-300 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-megapayer-muted capitalize">{order.status}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 megapayer-panel">
            <div className="w-20 h-20 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CustomIcons.History className="w-10 h-10 text-megapayer-muted" />
            </div>
            <h4 className="text-xl font-bold text-megapayer-text mb-3">No Orders</h4>
            <p className="text-megapayer-muted mb-6">Create your first order to start trading!</p>
            <Link
              href="/p2p"
              className="inline-flex items-center gap-2 px-6 py-3 megapayer-btn-primary rounded-xl"
            >
              <CustomIcons.Plus className="w-5 h-5" />
              Create Order
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}

