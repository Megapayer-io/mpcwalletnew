import { create } from 'zustand'
import { useWalletStore } from './wallet'

export interface Order {
  id: string
  userId: string
  type: 'buy' | 'sell'
  chainId: number
  tokenAddress: string | null
  tokenSymbol: string
  tokenName: string
  amount: string
  pricePerUnit: string
  totalPrice: string
  fiatCurrency: string
  paymentMethodIds: string[]
  minAmount?: string | null
  maxAmount?: string | null
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  expiresAt?: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    walletAddress: string
    username?: string | null
    reputationScore: number
    totalTrades: number
    completedTrades: number
    isVerified: boolean
  }
}

export interface Trade {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  chainId: number
  tokenAddress: string
  tokenSymbol: string
  amount: string
  pricePerUnit: string
  totalPrice: string
  fiatCurrency: string
  paymentMethodId?: string | null
  escrowAddress?: string | null
  escrowTxHash?: string | null
  status: 'pending' | 'escrow_locked' | 'payment_pending' | 'payment_confirmed' | 'completed' | 'cancelled' | 'disputed'
  buyerPaymentConfirmed: boolean
  sellerPaymentConfirmed: boolean
  buyerConfirmedAt?: string | null
  sellerConfirmedAt?: string | null
  completedAt?: string | null
  cancelledAt?: string | null
  cancellationReason?: string | null
  createdAt: string
  updatedAt: string
  buyer?: {
    id: string
    walletAddress: string
    username?: string | null
    reputationScore: number
    totalTrades: number
    completedTrades: number
    isVerified: boolean
  }
  seller?: {
    id: string
    walletAddress: string
    username?: string | null
    reputationScore: number
    totalTrades: number
    completedTrades: number
    isVerified: boolean
  }
  order?: Order
  paymentMethod?: any
}

export interface TradeMessage {
  id: string
  tradeId: string
  senderId: string
  message: string
  messageType: 'text' | 'system' | 'payment_confirmation'
  isRead: boolean
  createdAt: string
  sender?: {
    id: string
    walletAddress: string
    username?: string | null
  }
}

export interface PaymentMethod {
  id: string
  userId: string
  type: string
  details: any
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

interface P2PStore {
  // Auth
  authToken: string | null
  user: {
    id: string
    walletAddress: string
    username?: string | null
    email?: string | null
    isAdmin: boolean
  } | null

  // Orders
  orders: Order[]
  myOrders: Order[]
  selectedOrder: Order | null
  isLoadingOrders: boolean
  ordersFilters: {
    type?: 'buy' | 'sell'
    chainId?: number
    tokenSymbol?: string
    status?: string
  }

  // Trades
  trades: Trade[]
  selectedTrade: Trade | null
  tradeMessages: TradeMessage[]
  isLoadingTrades: boolean
  tradesFilters: {
    status?: string
  }

  // Payment Methods
  paymentMethods: PaymentMethod[]
  isLoadingPaymentMethods: boolean

  // Notifications
  notifications: Notification[]
  unreadCount: number
  isLoadingNotifications: boolean

  // UI State
  currentView: 'dashboard' | 'orders' | 'trade' | 'my-orders' | 'payment-methods' | 'admin'
  showCreateOrderModal: boolean
  showOrderDetailsModal: boolean

  // Actions
  setAuthToken: (token: string | null) => void
  setUser: (user: any) => void
  login: (walletAddress: string) => Promise<void>
  logout: () => void

  // Orders
  fetchOrders: () => Promise<void>
  fetchMyOrders: () => Promise<void>
  createOrder: (orderData: any) => Promise<Order>
  updateOrder: (orderId: string, data: any) => Promise<void>
  cancelOrder: (orderId: string) => Promise<void>
  setSelectedOrder: (order: Order | null) => void
  setOrdersFilters: (filters: any) => void

  // Trades
  fetchTrades: () => Promise<void>
  acceptOrder: (orderId: string, data: any) => Promise<Trade>
  getTrade: (tradeId: string) => Promise<Trade>
  confirmPaymentSent: (tradeId: string) => Promise<void>
  confirmPaymentReceived: (tradeId: string) => Promise<void>
  cancelTrade: (tradeId: string, reason: string) => Promise<void>
  setSelectedTrade: (trade: Trade | null) => void
  setTradesFilters: (filters: any) => void

  // Messages
  fetchTradeMessages: (tradeId: string) => Promise<void>
  sendMessage: (tradeId: string, message: string) => Promise<void>

  // Payment Methods
  fetchPaymentMethods: () => Promise<void>
  createPaymentMethod: (data: any) => Promise<PaymentMethod>
  updatePaymentMethod: (id: string, data: any) => Promise<void>
  deletePaymentMethod: (id: string) => Promise<void>

  // Notifications
  fetchNotifications: () => Promise<void>
  markNotificationAsRead: (id: string) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>

  // UI
  setCurrentView: (view: any) => void
  setShowCreateOrderModal: (show: boolean) => void
  setShowOrderDetailsModal: (show: boolean) => void
}

export const useP2PStore = create<P2PStore>((set, get) => ({
  // Initial state
  authToken: null,
  user: null,
  orders: [],
  myOrders: [],
  selectedOrder: null,
  isLoadingOrders: false,
  ordersFilters: {},
  trades: [],
  selectedTrade: null,
  tradeMessages: [],
  isLoadingTrades: false,
  tradesFilters: {},
  paymentMethods: [],
  isLoadingPaymentMethods: false,
  notifications: [],
  unreadCount: 0,
  isLoadingNotifications: false,
  currentView: 'dashboard',
  showCreateOrderModal: false,
  showOrderDetailsModal: false,

  // Auth
  setAuthToken: (token) => set({ authToken: token }),
  setUser: (user) => set({ user }),
  login: async (walletAddress) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      })
      const data = await response.json()
      if (data.token) {
        set({ authToken: data.token, user: data.user })
        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('p2p_token', data.token)
        }
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },
  logout: () => {
    set({ authToken: null, user: null })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('p2p_token')
    }
  },

  // Orders
  fetchOrders: async () => {
    set({ isLoadingOrders: true })
    try {
      const { authToken, ordersFilters } = get()
      const params = new URLSearchParams()
      if (ordersFilters.type) params.append('type', ordersFilters.type)
      if (ordersFilters.chainId) params.append('chainId', ordersFilters.chainId.toString())
      if (ordersFilters.tokenSymbol) params.append('tokenSymbol', ordersFilters.tokenSymbol)
      if (ordersFilters.status) params.append('status', ordersFilters.status)

      const response = await fetch(`/api/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      set({ orders: data.orders || [], isLoadingOrders: false })
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      set({ isLoadingOrders: false })
    }
  },

  fetchMyOrders: async () => {
    try {
      const { authToken } = get()
      const response = await fetch('/api/orders/my', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      set({ myOrders: data.orders || [] })
    } catch (error) {
      console.error('Failed to fetch my orders:', error)
    }
  },

  createOrder: async (orderData) => {
    const { authToken } = get()
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(orderData),
    })
    const data = await response.json()
    if (data.order) {
      await get().fetchOrders()
      await get().fetchMyOrders()
      return data.order
    }
    throw new Error(data.error || 'Failed to create order')
  },

  updateOrder: async (orderId, data) => {
    const { authToken } = get()
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    })
    await get().fetchOrders()
    await get().fetchMyOrders()
  },

  cancelOrder: async (orderId) => {
    const { authToken } = get()
    await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    await get().fetchOrders()
    await get().fetchMyOrders()
  },

  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setOrdersFilters: (filters) => set({ ordersFilters: filters }),

  // Trades
  fetchTrades: async () => {
    set({ isLoadingTrades: true })
    try {
      const { authToken, tradesFilters } = get()
      const params = new URLSearchParams()
      if (tradesFilters.status) params.append('status', tradesFilters.status)

      const response = await fetch(`/api/trades?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      set({ trades: data.trades || [], isLoadingTrades: false })
    } catch (error) {
      console.error('Failed to fetch trades:', error)
      set({ isLoadingTrades: false })
    }
  },

  acceptOrder: async (orderId, data) => {
    const { authToken } = get()
    const response = await fetch('/api/trades/accept', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ orderId, ...data }),
    })
    const tradeData = await response.json()
    if (tradeData.trade) {
      await get().fetchTrades()
      await get().fetchOrders()
      return tradeData.trade
    }
    throw new Error(tradeData.error || 'Failed to accept order')
  },

  getTrade: async (tradeId) => {
    const { authToken } = get()
    const response = await fetch(`/api/trades/${tradeId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    const data = await response.json()
    if (data.trade) {
      set({ selectedTrade: data.trade, tradeMessages: data.messages || [] })
      return data.trade
    }
    throw new Error(data.error || 'Failed to fetch trade')
  },

  confirmPaymentSent: async (tradeId) => {
    const { authToken } = get()
    await fetch(`/api/trades/${tradeId}/payment-confirmed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({}),
    })
    await get().getTrade(tradeId)
    await get().fetchTrades()
  },

  confirmPaymentReceived: async (tradeId) => {
    const { authToken } = get()
    await fetch(`/api/trades/${tradeId}/payment-received`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    await get().getTrade(tradeId)
    await get().fetchTrades()
  },

  cancelTrade: async (tradeId, reason) => {
    const { authToken } = get()
    await fetch(`/api/trades/${tradeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ reason }),
    })
    await get().fetchTrades()
  },

  setSelectedTrade: (trade) => set({ selectedTrade: trade }),
  setTradesFilters: (filters) => set({ tradesFilters: filters }),

  // Messages
  fetchTradeMessages: async (tradeId) => {
    const { authToken } = get()
    const response = await fetch(`/api/trades/${tradeId}/messages`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    const data = await response.json()
    set({ tradeMessages: data.messages || [] })
  },

  sendMessage: async (tradeId, message) => {
    const { authToken } = get()
    await fetch(`/api/trades/${tradeId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ message }),
    })
    await get().fetchTradeMessages(tradeId)
  },

  // Payment Methods
  fetchPaymentMethods: async () => {
    set({ isLoadingPaymentMethods: true })
    try {
      const { authToken } = get()
      const response = await fetch('/api/payment-methods', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      set({ paymentMethods: data.paymentMethods || [], isLoadingPaymentMethods: false })
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
      set({ isLoadingPaymentMethods: false })
    }
  },

  createPaymentMethod: async (data) => {
    const { authToken } = get()
    const response = await fetch('/api/payment-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    await get().fetchPaymentMethods()
    return result.paymentMethod
  },

  updatePaymentMethod: async (id, data) => {
    const { authToken } = get()
    await fetch(`/api/payment-methods/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    })
    await get().fetchPaymentMethods()
  },

  deletePaymentMethod: async (id) => {
    const { authToken } = get()
    await fetch(`/api/payment-methods/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    await get().fetchPaymentMethods()
  },

  // Notifications
  fetchNotifications: async () => {
    set({ isLoadingNotifications: true })
    try {
      const { authToken } = get()
      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      const unreadCount = data.notifications?.filter((n: Notification) => !n.isRead).length || 0
      set({ notifications: data.notifications || [], unreadCount, isLoadingNotifications: false })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      set({ isLoadingNotifications: false })
    }
  },

  markNotificationAsRead: async (id) => {
    const { authToken } = get()
    await fetch(`/api/notifications/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ isRead: true }),
    })
    await get().fetchNotifications()
  },

  markAllNotificationsAsRead: async () => {
    const { authToken } = get()
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ markAllAsRead: true }),
    })
    await get().fetchNotifications()
  },

  // UI
  setCurrentView: (view) => set({ currentView: view }),
  setShowCreateOrderModal: (show) => set({ showCreateOrderModal: show }),
  setShowOrderDetailsModal: (show) => set({ showOrderDetailsModal: show }),
}))

// Initialize auth on mount
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('p2p_token')
  if (token) {
    useP2PStore.getState().setAuthToken(token)
  }
}

