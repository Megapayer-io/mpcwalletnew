'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { useWalletStore } from '@/store/wallet'
import { useP2PStore } from '@/store/p2p'
import { CustomIcons } from '@/components/icons/CustomIcons'

export default function DisputeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const disputeId = params?.id as string

  const { address, isUnlocked } = useWalletStore()
  const {
    authToken,
    login,
    user,
  } = useP2PStore()

  const [dispute, setDispute] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState('')
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
    if (authToken && disputeId) {
      fetchDispute()
      fetchMessages()
      // Poll for updates
      const interval = setInterval(() => {
        fetchDispute()
        fetchMessages()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [authToken, disputeId])

  const fetchDispute = async () => {
    try {
      const response = await fetch(`/api/disputes/${disputeId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      if (data.dispute) {
        setDispute(data.dispute)
      }
    } catch (error) {
      console.error('Failed to fetch dispute:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/disputes/${disputeId}/messages`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    try {
      await fetch(`/api/disputes/${disputeId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ message: message.trim() }),
      })
      setMessage('')
      await fetchMessages()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  if (!dispute) {
    return (
      <Layout title="Dispute Details">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal"></div>
        </div>
      </Layout>
    )
  }

  const isAdmin = user?.isAdmin || false

  return (
    <Layout title={`Dispute #${disputeId.slice(0, 8)}`}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Dispute Info */}
        <div className="megapayer-panel p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-megapayer-text font-heading">Dispute Details</h2>
              <p className="text-sm text-megapayer-muted mt-1">
                Status: <span className="font-semibold capitalize">{dispute.status}</span>
              </p>
            </div>
            <span className="px-3 py-1 bg-megapayer-accent/20 text-megapayer-accent rounded-lg text-xs font-medium">
              {dispute.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-megapayer-muted mb-1">Trade ID</p>
              <p className="font-semibold text-megapayer-text">{dispute.tradeId}</p>
            </div>
            <div>
              <p className="text-sm text-megapayer-muted mb-1">Reason</p>
              <p className="font-semibold text-megapayer-text">{dispute.reason}</p>
            </div>
            <div>
              <p className="text-sm text-megapayer-muted mb-1">Description</p>
              <p className="text-megapayer-text">{dispute.description || 'No description provided'}</p>
            </div>
            <div>
              <p className="text-sm text-megapayer-muted mb-1">Created</p>
              <p className="text-megapayer-text">{new Date(dispute.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {isAdmin && dispute.status === 'open' && (
            <div className="mt-6 pt-6 border-t border-megapayer-border">
              <h3 className="text-lg font-bold text-megapayer-text mb-4">Admin Actions</h3>
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    if (confirm('Resolve dispute in favor of buyer?')) {
                      try {
                        await fetch(`/api/disputes/${disputeId}/resolve`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                          },
                          body: JSON.stringify({ resolution: 'buyer' }),
                        })
                        await fetchDispute()
                        await fetchMessages()
                      } catch (error) {
                        alert('Failed to resolve dispute')
                      }
                    }
                  }}
                  className="px-6 py-3 bg-megapayer-emerald/20 text-megapayer-emerald rounded-xl font-semibold hover:bg-megapayer-emerald/30 transition-all duration-300"
                >
                  Resolve for Buyer
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Resolve dispute in favor of seller?')) {
                      try {
                        await fetch(`/api/disputes/${disputeId}/resolve`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                          },
                          body: JSON.stringify({ resolution: 'seller' }),
                        })
                        await fetchDispute()
                        await fetchMessages()
                      } catch (error) {
                        alert('Failed to resolve dispute')
                      }
                    }
                  }}
                  className="px-6 py-3 bg-megapayer-violet/20 text-megapayer-violet rounded-xl font-semibold hover:bg-megapayer-violet/30 transition-all duration-300"
                >
                  Resolve for Seller
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="megapayer-panel p-6 animate-fade-in-up">
          <h3 className="text-xl font-bold text-megapayer-text font-heading mb-6">Dispute Messages</h3>

          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.length > 0 ? (
              messages.map((msg) => {
                const isOwnMessage = msg.senderId === user?.id
                const isAdminMsg = msg.sender?.isAdmin

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isAdminMsg ? 'justify-center' : ''}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-xl ${
                        isAdminMsg
                          ? 'bg-megapayer-accent/20 text-megapayer-accent'
                          : isOwnMessage
                          ? 'bg-gradient-to-r from-megapayer-teal to-megapayer-violet text-white'
                          : 'bg-megapayer-panel-soft text-megapayer-text'
                      }`}
                    >
                      {!isAdminMsg && (
                        <p className="text-xs opacity-70 mb-1">
                          {msg.sender?.username || `${msg.sender?.walletAddress.slice(0, 6)}...${msg.sender?.walletAddress.slice(-4)}`}
                        </p>
                      )}
                      {isAdminMsg && (
                        <p className="text-xs opacity-70 mb-1 font-semibold">Admin</p>
                      )}
                      <p className={isAdminMsg ? 'text-sm font-semibold' : ''}>{msg.message}</p>
                      <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-megapayer-muted'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-megapayer-muted">
                <CustomIcons.MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isAdmin ? "Type admin message..." : "Type your message..."}
              className="flex-1 p-3 bg-megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text placeholder-megapayer-muted focus:outline-none focus:border-megapayer-teal"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="px-6 py-3 megapayer-btn-primary rounded-xl disabled:opacity-50 transition-all duration-300"
            >
              <CustomIcons.Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

