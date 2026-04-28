'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { useWalletStore } from '@/store/wallet'
import { useP2PStore } from '@/store/p2p'
import { CustomIcons } from '@/components/icons/CustomIcons'
import Link from 'next/link'

export default function PaymentMethodsPage() {
  const router = useRouter()
  const { address, isUnlocked } = useWalletStore()
  const {
    authToken,
    paymentMethods,
    isLoadingPaymentMethods,
    fetchPaymentMethods,
    deletePaymentMethod,
    login,
    setShowCreateOrderModal,
  } = useP2PStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    type: 'bank_transfer',
    details: {},
  })

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
      fetchPaymentMethods()
    }
  }, [authToken, fetchPaymentMethods])

  const handleAddPaymentMethod = async () => {
    // This would open a modal or form
    // For now, just show placeholder
    alert('Payment method form will be implemented')
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      await deletePaymentMethod(id)
    }
  }

  const paymentMethodTypes = {
    bank_transfer: 'Bank Transfer',
    paypal: 'PayPal',
    venmo: 'Venmo',
    zelle: 'Zelle',
    cashapp: 'Cash App',
    crypto: 'Cryptocurrency',
  }

  return (
    <Layout title="Payment Methods" subtitle="Manage your payment methods">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-megapayer-text font-heading">Payment Methods</h2>
            <p className="text-megapayer-muted mt-1">Add and manage payment methods for trading</p>
          </div>
          <button
            onClick={handleAddPaymentMethod}
            className="px-6 py-3 megapayer-btn-primary rounded-xl font-semibold"
          >
            <CustomIcons.Plus className="w-5 h-5 inline mr-2" />
            Add Payment Method
          </button>
        </div>

        {/* Payment Methods List */}
        {isLoadingPaymentMethods ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-megapayer-teal mx-auto mb-4"></div>
            <p className="text-megapayer-muted">Loading payment methods...</p>
          </div>
        ) : paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="megapayer-panel p-6 animate-fade-in-up"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-megapayer-teal/20 to-megapayer-violet/20 rounded-xl flex items-center justify-center">
                      <CustomIcons.Wallet className="w-6 h-6 text-megapayer-teal" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-megapayer-text capitalize">
                          {paymentMethodTypes[pm.type as keyof typeof paymentMethodTypes] || pm.type}
                        </h4>
                        {pm.isVerified && (
                          <span className="px-2 py-1 bg-megapayer-emerald/20 text-megapayer-emerald text-xs rounded">
                            ✓ Verified
                          </span>
                        )}
                        {!pm.isActive && (
                          <span className="px-2 py-1 bg-megapayer-muted/20 text-megapayer-muted text-xs rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-megapayer-muted">
                        Added {new Date(pm.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(pm.id)}
                      className="p-2 text-megapayer-accent hover:bg-megapayer-accent/10 rounded-lg transition-all duration-300"
                    >
                      <CustomIcons.Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 megapayer-panel">
            <div className="w-20 h-20 bg-gradient-to-br from-megapayer-panel-soft to-megapayer-panel rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CustomIcons.Wallet className="w-10 h-10 text-megapayer-muted" />
            </div>
            <h4 className="text-xl font-bold text-megapayer-text mb-3">No Payment Methods</h4>
            <p className="text-megapayer-muted mb-6">Add a payment method to start receiving payments!</p>
            <button
              onClick={handleAddPaymentMethod}
              className="inline-flex items-center gap-2 px-6 py-3 megapayer-btn-primary rounded-xl"
            >
              <CustomIcons.Plus className="w-5 h-5" />
              Add Payment Method
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}

