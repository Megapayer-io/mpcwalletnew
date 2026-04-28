'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { useWalletStore } from '@/store/wallet'
import { useP2PStore } from '@/store/p2p'
import { CustomIcons } from '@/components/icons/CustomIcons'
import { CreateOrderModal } from '@/components/p2p/CreateOrderModal'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id as string

  const { address, isUnlocked, currentNetwork, balance } = useWalletStore()
  const {
    authToken,
    orders,
    acceptOrder,
    login,
    fetchOrders,
    paymentMethods,
    fetchPaymentMethods,
  } = useP2PStore()

  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [isAccepting, setIsAccepting] = useState(false)

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
    if (authToken && orderId) {
      fetchOrders()
      fetchPaymentMethods()
    }
  }, [authToken, orderId, fetchOrders, fetchPaymentMethods])

  useEffect(() => {
    if (orders.length > 0 && orderId) {
      const order = orders.find((o) => o.id === orderId)
      if (order) {
        setSelectedOrder(order)
      } else {
        // Try to fetch from API
        fetch(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.order) {
              setSelectedOrder(data.order)
            }
          })
          .catch(console.error)
      }
    }
  }, [orders, orderId, authToken])

  const handleAcceptOrder = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method')
      return
    }

    if (selectedOrder?.type === 'sell' && !balance) {
      alert('Insufficient balance to accept this sell order')
      return
    }

    setIsAccepting(true)
    try {
      const trade = await acceptOrder(orderId, {
        paymentMethodId: selectedPaymentMethod,
      })
      router.push(`/p2p/trades/${trade.id}`)
    } catch (error: any) {
      alert(error.message || 'Failed to accept order')
    } finally {
      setIsAccepting(false)
    }
  }

  if (!selectedOrder) {
    return (
      <Layout title="Order Details">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal"></div>
        </div>
      </Layout>
    )
  }

  const canAccept = selectedOrder.status === 'active' && selectedOrder.userId !== authToken

  return (
    <Layout title={`Order #${orderId.slice(0, 8)}`}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Order Info Card */}
        <div className="megapayer-panel p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-megapayer-text font-heading">
                {selectedOrder.type === 'buy' ? 'Buy' : 'Sell'} Order
              </h2>
              <p className="text-sm text-megapayer-muted mt-1">
                Status: <span className="font-semibold capitalize">{selectedOrder.status}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  selectedOrder.type === 'buy'
                    ? 'bg-megapayer-emerald/20 text-megapayer-emerald'
                    : 'bg-megapayer-accent/20 text-megapayer-accent'
                }`}
              >
                {selectedOrder.type === 'buy' ? 'BUY' : 'SELL'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-megapayer-muted mb-2">Token</p>
              <p className="text-lg font-semibold text-megapayer-text">
                {selectedOrder.tokenSymbol} ({selectedOrder.tokenName})
              </p>
            </div>
            <div>
              <p className="text-sm text-megapayer-muted mb-2">Chain</p>
              <p className="text-lg font-semibold text-megapayer-text">
                Chain ID: {selectedOrder.chainId}
              </p>
            </div>
            <div>
              <p className="text-sm text-megapayer-muted mb-2">Amount</p>
              <p className="text-lg font-semibold text-megapayer-text">
                {selectedOrder.amount} {selectedOrder.tokenSymbol}
              </p>
            </div>
            <div>
              <p className="text-sm text-megapayer-muted mb-2">Price per Unit</p>
              <p className="text-lg font-semibold text-megapayer-text">
                ${selectedOrder.pricePerUnit} {selectedOrder.fiatCurrency}
              </p>
            </div>
            <div>
              <p className="text-sm text-megapayer-muted mb-2">Total Price</p>
              <p className="text-2xl font-bold text-megapayer-text">
                ${selectedOrder.totalPrice} {selectedOrder.fiatCurrency}
              </p>
            </div>
            {selectedOrder.user && (
              <div>
                <p className="text-sm text-megapayer-muted mb-2">Trader</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-megapayer-text">
                    {selectedOrder.user.username || `${selectedOrder.user.walletAddress.slice(0, 6)}...${selectedOrder.user.walletAddress.slice(-4)}`}
                  </p>
                  {selectedOrder.user.isVerified && (
                    <span className="px-2 py-1 bg-megapayer-emerald/20 text-megapayer-emerald text-xs rounded">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-megapayer-muted mt-1">
                  {selectedOrder.user.reputationScore.toFixed(1)}⭐ • {selectedOrder.user.completedTrades} trades
                </p>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          {selectedOrder.paymentMethodIds && selectedOrder.paymentMethodIds.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-megapayer-text mb-3">Accepted Payment Methods</p>
              <div className="flex flex-wrap gap-2">
                {selectedOrder.paymentMethodIds.map((pmId: string) => {
                  const pm = paymentMethods.find((p) => p.id === pmId)
                  return pm ? (
                    <span
                      key={pmId}
                      className="px-3 py-1 bg-megapayer-panel-soft rounded-lg text-sm text-megapayer-text capitalize"
                    >
                      {pm.type.replace('_', ' ')}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* Accept Order Section */}
          {canAccept && (
            <div className="pt-6 border-t border-megapayer-border">
              <h3 className="text-lg font-bold text-megapayer-text mb-4">Accept This Order</h3>
              
              {paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-megapayer-text mb-3">
                      Select Payment Method
                    </label>
                    <div className="space-y-2">
                      {paymentMethods
                        .filter((pm) => pm.isActive && selectedOrder.paymentMethodIds?.includes(pm.id))
                        .map((pm) => (
                          <label
                            key={pm.id}
                            className={`flex items-center gap-3 p-4 bg-megapayer-panel-soft rounded-xl border-2 cursor-pointer transition-all ${
                              selectedPaymentMethod === pm.id
                                ? 'border-megapayer-teal'
                                : 'border-megapayer-border hover:border-megapayer-teal/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={pm.id}
                              checked={selectedPaymentMethod === pm.id}
                              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                              className="w-5 h-5"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-megapayer-text capitalize">
                                {pm.type.replace('_', ' ')}
                              </p>
                              {pm.isVerified && (
                                <span className="text-xs text-megapayer-emerald">✓ Verified</span>
                              )}
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAcceptOrder}
                    disabled={!selectedPaymentMethod || isAccepting}
                    className="w-full px-6 py-3 megapayer-btn-primary rounded-xl font-semibold disabled:opacity-50 transition-all duration-300"
                  >
                    {isAccepting ? 'Accepting...' : `Accept ${selectedOrder.type === 'buy' ? 'Sell' : 'Buy'} Order`}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-megapayer-panel-soft rounded-xl border border-megapayer-border text-center">
                  <p className="text-sm text-megapayer-muted mb-3">
                    You need to add a payment method that matches this order's requirements
                  </p>
                  <button
                    onClick={() => router.push('/p2p/payment-methods')}
                    className="text-sm text-megapayer-teal hover:text-megapayer-teal/80 font-medium"
                  >
                    Add Payment Method →
                  </button>
                </div>
              )}
            </div>
          )}

          {!canAccept && selectedOrder.status === 'active' && (
            <div className="pt-6 border-t border-megapayer-border">
              <p className="text-megapayer-muted text-center">This is your own order</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

