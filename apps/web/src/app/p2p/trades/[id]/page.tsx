'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { useWalletStore } from '@/store/wallet'
import { useP2PStore } from '@/store/p2p'
import { CustomIcons } from '@/components/icons/CustomIcons'
import { TradeChat } from '@/components/p2p/TradeChat'

export default function TradeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tradeId = params?.id as string

  const { address, isUnlocked } = useWalletStore()
  const {
    authToken,
    selectedTrade,
    tradeMessages,
    getTrade,
    fetchTradeMessages,
    confirmPaymentSent,
    confirmPaymentReceived,
    cancelTrade,
    user,
  } = useP2PStore()

  useEffect(() => {
    if (!isUnlocked || !address) {
      router.push('/unlock')
      return
    }

    if (tradeId && authToken) {
      getTrade(tradeId)
      fetchTradeMessages(tradeId)
    }
  }, [tradeId, authToken, isUnlocked, address, router, getTrade, fetchTradeMessages])

  if (!selectedTrade) {
    return (
      <Layout title="Trade Details">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal"></div>
        </div>
      </Layout>
    )
  }

  const isBuyer = selectedTrade.buyerId === user?.id
  const isSeller = selectedTrade.sellerId === user?.id
  const counterparty = isBuyer ? selectedTrade.seller : selectedTrade.buyer

  const canConfirmPaymentSent = isBuyer && !selectedTrade.buyerPaymentConfirmed && selectedTrade.status !== 'completed' && selectedTrade.status !== 'cancelled'
  const canConfirmPaymentReceived = isSeller && !selectedTrade.sellerPaymentConfirmed && selectedTrade.status !== 'completed' && selectedTrade.status !== 'cancelled'

  const handleConfirmPaymentSent = async () => {
    if (confirm('Have you sent the payment? This action cannot be undone.')) {
      await confirmPaymentSent(tradeId)
    }
  }

  const handleConfirmPaymentReceived = async () => {
    if (confirm('Have you received the payment? This will release escrow funds.')) {
      await confirmPaymentReceived(tradeId)
    }
  }

  const handleCancelTrade = async () => {
    const reason = prompt('Please provide a reason for cancelling this trade:')
    if (reason) {
      await cancelTrade(tradeId, reason)
      router.push('/p2p/trades')
    }
  }

  return (
    <Layout title={`Trade #${tradeId.slice(0, 8)}`}>
      <div className="space-y-6">
        {/* Trade Info Card */}
        <div className="megapayer-panel p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-megapayer-text font-heading">
                Trade #{tradeId.slice(0, 8)}
              </h2>
              <p className="text-sm text-megapayer-muted mt-1">
                Status: <span className="font-semibold capitalize">{selectedTrade.status.replace('_', ' ')}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  selectedTrade.status === 'completed'
                    ? 'bg-megapayer-emerald/20 text-megapayer-emerald'
                    : selectedTrade.status === 'cancelled' || selectedTrade.status === 'disputed'
                    ? 'bg-megapayer-accent/20 text-megapayer-accent'
                    : 'bg-megapayer-teal/20 text-megapayer-teal'
                }`}
              >
                {selectedTrade.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-megapayer-muted mb-2">You are</p>
              <p className="text-lg font-semibold text-megapayer-text capitalize">{isBuyer ? 'Buyer' : 'Seller'}</p>
            </div>
            <div>
              <p className="text-sm text-megapayer-muted mb-2">Counterparty</p>
              <p className="text-lg font-semibold text-megapayer-text">
                {counterparty?.username || `${counterparty?.walletAddress.slice(0, 6)}...${counterparty?.walletAddress.slice(-4)}`}
              </p>
              {counterparty && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-megapayer-muted">
                    {counterparty.reputationScore.toFixed(1)}⭐ • {counterparty.completedTrades} trades
                  </span>
                  {counterparty.isVerified && (
                    <span className="text-xs text-megapayer-emerald">✓ Verified</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-megapayer-muted mb-2">Amount</p>
              <p className="text-lg font-semibold text-megapayer-text">
                {selectedTrade.amount} {selectedTrade.tokenSymbol}
              </p>
            </div>
            <div>
              <p className="text-sm text-megapayer-muted mb-2">Price</p>
              <p className="text-lg font-semibold text-megapayer-text">
                ${selectedTrade.pricePerUnit} per {selectedTrade.tokenSymbol}
              </p>
            </div>
            <div>
              <p className="text-sm text-megapayer-muted mb-2">Total Price</p>
              <p className="text-lg font-semibold text-megapayer-text">
                ${selectedTrade.totalPrice} {selectedTrade.fiatCurrency}
              </p>
            </div>
            <div>
              <p className="text-sm text-megapayer-muted mb-2">Payment Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedTrade.buyerPaymentConfirmed ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'}`}></div>
                <span className="text-sm text-megapayer-text">Buyer: {selectedTrade.buyerPaymentConfirmed ? 'Paid' : 'Pending'}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${selectedTrade.sellerPaymentConfirmed ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'}`}></div>
                <span className="text-sm text-megapayer-text">Seller: {selectedTrade.sellerPaymentConfirmed ? 'Confirmed' : 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {selectedTrade.status !== 'completed' && selectedTrade.status !== 'cancelled' && (
            <div className="flex gap-4 pt-6 border-t border-megapayer-border">
              {canConfirmPaymentSent && (
                <button
                  onClick={handleConfirmPaymentSent}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-megapayer-emerald to-megapayer-teal text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300"
                >
                  Confirm Payment Sent
                </button>
              )}
              {canConfirmPaymentReceived && (
                <button
                  onClick={handleConfirmPaymentReceived}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-megapayer-teal to-megapayer-violet text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300"
                >
                  Confirm Payment Received
                </button>
              )}
              {(isBuyer || isSeller) && selectedTrade.status !== 'disputed' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push(`/p2p/disputes?create=${tradeId}`)}
                    className="px-6 py-3 bg-megapayer-accent/20 text-megapayer-accent rounded-xl font-semibold hover:bg-megapayer-accent/30 transition-all duration-300"
                  >
                    File Dispute
                  </button>
                  <button
                    onClick={handleCancelTrade}
                    className="px-6 py-3 bg-megapayer-panel-soft text-megapayer-text rounded-xl font-semibold hover:bg-megapayer-panel transition-all duration-300"
                  >
                    Cancel Trade
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trade Chat */}
        <TradeChat tradeId={tradeId} />
      </div>
    </Layout>
  )
}

