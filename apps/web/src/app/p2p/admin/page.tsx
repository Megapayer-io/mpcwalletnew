'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { useWalletStore } from '@/store/wallet'
import { useP2PStore } from '@/store/p2p'
import { CustomIcons } from '@/components/icons/CustomIcons'

export default function AdminPanel() {
  const router = useRouter()
  const { address, isUnlocked } = useWalletStore()
  const {
    authToken,
    user,
    login,
  } = useP2PStore()

  const [dashboard, setDashboard] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [disputes, setDisputes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'disputes' | 'orders' | 'trades'>('dashboard')

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
    if (authToken && user?.isAdmin) {
      fetchDashboard()
      fetchUsers()
      fetchDisputes()
    } else if (authToken && !user?.isAdmin) {
      router.push('/p2p')
    }
  }, [authToken, user, router])

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      setDashboard(data)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    }
  }

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDisputes = async () => {
    try {
      const response = await fetch('/api/admin/disputes', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      setDisputes(data.disputes || [])
    } catch (error) {
      console.error('Failed to fetch disputes:', error)
    }
  }

  const suspendUser = async (userId: string) => {
    const duration = prompt('Suspend duration in days (leave empty for indefinite):')
    if (duration === null) return

    try {
      await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ duration: duration ? parseInt(duration) : null }),
      })
      await fetchUsers()
    } catch (error) {
      console.error('Failed to suspend user:', error)
    }
  }

  const banUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return

    try {
      await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      await fetchUsers()
    } catch (error) {
      console.error('Failed to ban user:', error)
    }
  }

  if (!user?.isAdmin) {
    return (
      <Layout title="Admin Panel">
        <div className="text-center py-12">
          <CustomIcons.Shield className="w-16 h-16 mx-auto mb-4 text-megapayer-accent" />
          <h2 className="text-2xl font-bold text-megapayer-text mb-2">Access Denied</h2>
          <p className="text-megapayer-muted">You must be an admin to access this page.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Admin Panel" subtitle="Platform management">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-megapayer-border">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: CustomIcons.BarChart },
            { id: 'users', label: 'Users', icon: CustomIcons.User },
            { id: 'disputes', label: 'Disputes', icon: CustomIcons.AlertTriangle },
            { id: 'orders', label: 'Orders', icon: CustomIcons.History },
            { id: 'trades', label: 'Trades', icon: CustomIcons.ArrowLeftRight },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-megapayer-teal text-megapayer-teal'
                    : 'border-transparent text-megapayer-muted hover:text-megapayer-text'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboard && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="megapayer-panel p-6">
                <p className="text-sm text-megapayer-muted mb-1">Total Users</p>
                <p className="text-2xl font-bold text-megapayer-text">{dashboard.totalUsers || 0}</p>
              </div>
              <div className="megapayer-panel p-6">
                <p className="text-sm text-megapayer-muted mb-1">Active Orders</p>
                <p className="text-2xl font-bold text-megapayer-text">{dashboard.activeOrders || 0}</p>
              </div>
              <div className="megapayer-panel p-6">
                <p className="text-sm text-megapayer-muted mb-1">Active Trades</p>
                <p className="text-2xl font-bold text-megapayer-text">{dashboard.activeTrades || 0}</p>
              </div>
              <div className="megapayer-panel p-6">
                <p className="text-sm text-megapayer-muted mb-1">Open Disputes</p>
                <p className="text-2xl font-bold text-megapayer-text">{dashboard.openDisputes || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="megapayer-panel p-6">
            <h3 className="text-xl font-bold text-megapayer-text font-heading mb-6">User Management</h3>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal mx-auto mb-4"></div>
                <p className="text-megapayer-muted">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 bg-megapayer-panel-soft rounded-xl border border-megapayer-border"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-megapayer-text">
                            {u.username || `${u.walletAddress.slice(0, 6)}...${u.walletAddress.slice(-4)}`}
                          </p>
                          {u.isVerified && (
                            <span className="px-2 py-1 bg-megapayer-emerald/20 text-megapayer-emerald text-xs rounded">
                              Verified
                            </span>
                          )}
                          {u.isSuspended && (
                            <span className="px-2 py-1 bg-megapayer-accent/20 text-megapayer-accent text-xs rounded">
                              Suspended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-megapayer-muted">
                          {u.reputationScore.toFixed(1)}⭐ • {u.completedTrades} trades • {u.totalTrades} total
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => suspendUser(u.id)}
                          className="px-4 py-2 bg-megapayer-accent/20 text-megapayer-accent rounded-lg hover:bg-megapayer-accent/30 transition-all duration-300 text-sm font-medium"
                        >
                          Suspend
                        </button>
                        <button
                          onClick={() => banUser(u.id)}
                          className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm font-medium"
                        >
                          Ban
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === 'disputes' && (
          <div className="megapayer-panel p-6">
            <h3 className="text-xl font-bold text-megapayer-text font-heading mb-6">Dispute Management</h3>
            <div className="space-y-4">
              {disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="p-4 bg-megapayer-panel-soft rounded-xl border border-megapayer-border hover:border-megapayer-accent/50 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/p2p/disputes/${dispute.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-megapayer-text">Dispute #{dispute.id.slice(0, 8)}</h4>
                        <span className="px-2 py-1 bg-megapayer-accent/20 text-megapayer-accent text-xs rounded">
                          {dispute.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-megapayer-muted">
                        Trade: {dispute.tradeId.slice(0, 8)}... • Reason: {dispute.reason}
                      </p>
                    </div>
                    <CustomIcons.ChevronRight className="w-5 h-5 text-megapayer-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="megapayer-panel p-6">
            <h3 className="text-xl font-bold text-megapayer-text font-heading mb-6">Order Management</h3>
            <p className="text-megapayer-muted">Order management features coming soon...</p>
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === 'trades' && (
          <div className="megapayer-panel p-6">
            <h3 className="text-xl font-bold text-megapayer-text font-heading mb-6">Trade Management</h3>
            <p className="text-megapayer-muted">Trade management features coming soon...</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

