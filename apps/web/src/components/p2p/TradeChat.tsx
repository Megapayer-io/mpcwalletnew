'use client'

import { useEffect, useState, useRef } from 'react'
import { useP2PStore } from '@/store/p2p'
import { CustomIcons } from '@/components/icons/CustomIcons'

interface TradeChatProps {
  tradeId: string
}

export function TradeChat({ tradeId }: TradeChatProps) {
  const { tradeMessages, sendMessage, user, fetchTradeMessages } = useP2PStore()
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTradeMessages(tradeId)
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [tradeId, fetchTradeMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [tradeMessages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSending) return

    setIsSending(true)
    try {
      await sendMessage(tradeId, message.trim())
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="megapayer-panel p-6 animate-fade-in-up">
      <h3 className="text-xl font-bold text-megapayer-text font-heading mb-6">Trade Chat</h3>

      {/* Messages */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {tradeMessages.length > 0 ? (
          tradeMessages.map((msg) => {
            const isOwnMessage = msg.senderId === user?.id
            const isSystem = msg.messageType === 'system' || msg.messageType === 'payment_confirmation'

            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isSystem ? 'justify-center' : ''}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-xl ${
                    isSystem
                      ? 'bg-megapayer-panel-soft text-megapayer-muted text-center text-sm'
                      : isOwnMessage
                      ? 'bg-gradient-to-r from-megapayer-teal to-megapayer-violet text-white'
                      : 'bg-megapayer-panel-soft text-megapayer-text'
                  }`}
                >
                  {!isSystem && (
                    <p className="text-xs opacity-70 mb-1">
                      {msg.sender?.username || `${msg.sender?.walletAddress.slice(0, 6)}...${msg.sender?.walletAddress.slice(-4)}`}
                    </p>
                  )}
                  <p className={isSystem ? 'text-xs' : ''}>{msg.message}</p>
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
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 bg-megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text placeholder-megapayer-muted focus:outline-none focus:border-megapayer-teal"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className="px-6 py-3 megapayer-btn-primary rounded-xl disabled:opacity-50 transition-all duration-300"
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <CustomIcons.Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  )
}

