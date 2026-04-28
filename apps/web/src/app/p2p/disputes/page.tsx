'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { useWalletStore } from '@/store/wallet'
import { useP2PStore } from '@/store/p2p'
import { CustomIcons } from '@/components/icons/CustomIcons'

export default function DisputesPage() {
  const router = useRouter()
  const { address, isUnlocked } = useWalletStore()
  const {
    authToken,
    trades,
    login,
    fetchTrades,
  } = useP2PStore()

  const [disputes, setDisputes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
      fetchDisputes()
      fetchTrades()
      
      // Check for create dispute query param
      const urlParams = new URLSearchParams(window.location.search)
      const createTradeId = urlParams.get('create')
      if (createTradeId) {
        createDispute(createTradeId)
      }
    }
  }, [authToken, fetchTrades])

  const fetchDisputes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/disputes', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      setDisputes(data.disputes || [])
    } catch (error) {
      console.error('Failed to fetch disputes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createDispute = async (tradeId: string) => {
    const reason = prompt('Please provide a reason for the dispute:')
    if (!reason) return

    try {
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          tradeId,
          reason,
        }),
      })
      const data = await response.json()
      if (data.dispute) {
        await fetchDisputes()
        router.push(`/p2p/disputes/${data.dispute.id}`)
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create dispute')
    }
  }

  const disputedTrades = trades.filter((trade) => trade.status === 'disputed')

  // Find dispute ID for each disputed trade
  const getDisputeIdForTrade = (tradeId: string) => {
    const dispute = disputes.find((d) => d.tradeId === tradeId)
    return dispute?.id || null
  }

  return (
    <Layout title="Disputes" subtitle="Manage trade disputes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-megapayer-text font-heading">Disputes</h2>
            <p className="text-megapayer-muted mt-1">Manage and resolve trade disputes</p>
          </div>
        </div>

        {/* Active Disputes */}
        <div className="megapayer-panel p-6 animate-fade-in-up">
          <h3 className="text-xl font-bold text-megapayer-text font-heading mb-6">Active Disputes</h3>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal mx-auto mb-4"></div>
              <p className="text-megapayer-muted">Loading disputes...</p>
            </div>
          ) : disputes.length > 0 ? (
            <div className="space-y-4">
              {disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="p-6 bg-megapayer-panel-soft rounded-xl border border-megapayer-border hover:border-megapayer-accent/50 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/p2p/disputes/${dispute.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-megapayer-text">Dispute #{dispute.id.slice(0, 8)}</h4>
                        <span className="px-2 py-1 bg-megapayer-accent/20 text-megapayer-accent text-xs rounded">
                          {dispute.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-megapayer-muted">
                        Trade ID: {dispute.tradeId.slice(0, 8)}... • Reason: {dispute.reason}
                      </p>
                      <p className="text-xs text-megapayer-muted mt-1">
                        Created: {new Date(dispute.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <CustomIcons.ChevronRight className="w-5 h-5 text-megapayer-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CustomIcons.Shield className="w-10 h-10 text-megapayer-muted" />
              </div>
              <h4 className="text-xl font-bold text-megapayer-text mb-3">No Active Disputes</h4>
              <p className="text-megapayer-muted">All disputes have been resolved</p>
            </div>
          )}
        </div>

        {/* Create Dispute from Trades */}
        {disputedTrades.length > 0 && (
          <div className="megapayer-panel p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold text-megapayer-text font-heading mb-6">Disputed Trades</h3>
            <div className="space-y-4">
              {disputedTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="p-4 bg-megapayer-panel-soft rounded-xl border border-megapayer-accent/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-megapayer-text">
                        Trade #{trade.id.slice(0, 8)} • {trade.tokenSymbol}
                      </p>
                      <p className="text-sm text-megapayer-muted">
                        {trade.amount} {trade.tokenSymbol} • ${trade.totalPrice}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const disputeId = getDisputeIdForTrade(trade.id)
                        if (disputeId) {
                          router.push(`/p2p/disputes/${disputeId}`)
                        } else {
                          alert('Dispute not found for this trade')
                        }
                      }}
                      className="px-4 py-2 bg-megapayer-accent/20 text-megapayer-accent rounded-lg hover:bg-megapayer-accent/30 transition-all duration-300 text-sm font-medium"
                    >
                      View Dispute
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Dispute Button */}
        {trades.filter((t) => t.status !== 'completed' && t.status !== 'cancelled' && t.status !== 'disputed').length > 0 && (
          <div className="megapayer-panel p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold text-megapayer-text font-heading mb-6">File a Dispute</h3>
            <p className="text-sm text-megapayer-muted mb-4">
              If you have an issue with an active trade, you can file a dispute for admin review.
            </p>
            <div className="space-y-2">
              {trades
                .filter((t) => t.status !== 'completed' && t.status !== 'cancelled' && t.status !== 'disputed')
                .slice(0, 5)
                .map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-4 bg-megapayer-panel-soft rounded-xl border border-megapayer-border"
                  >
                    <div>
                      <p className="font-semibold text-megapayer-text">
                        Trade #{trade.id.slice(0, 8)} • {trade.tokenSymbol}
                      </p>
                      <p className="text-sm text-megapayer-muted">
                        Status: {trade.status.replace('_', ' ')}
                      </p>
                    </div>
                    <button
                      onClick={() => createDispute(trade.id)}
                      className="px-4 py-2 bg-megapayer-accent/20 text-megapayer-accent rounded-lg hover:bg-megapayer-accent/30 transition-all duration-300 text-sm font-medium"
                    >
                      File Dispute
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

