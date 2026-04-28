'use client'

import { useState, useEffect } from 'react'
import { useP2PStore } from '@/store/p2p'
import { useWalletStore } from '@/store/wallet'
import { CustomIcons } from '@/components/icons/CustomIcons'

interface CreateOrderModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateOrderModal({ isOpen, onClose }: CreateOrderModalProps) {
  const { currentNetwork, networks } = useWalletStore()
  const { createOrder, paymentMethods, fetchPaymentMethods } = useP2PStore()

  const [type, setType] = useState<'buy' | 'sell'>('sell')
  const [chainId, setChainId] = useState(currentNetwork?.chainId || 137)
  const [tokenSymbol, setTokenSymbol] = useState(currentNetwork?.symbol || 'MATIC')
  const [tokenName, setTokenName] = useState(currentNetwork?.name || 'Polygon')
  const [tokenAddress, setTokenAddress] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [fiatCurrency, setFiatCurrency] = useState('USD')
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([])
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods()
      setChainId(currentNetwork?.chainId || 137)
      setTokenSymbol(currentNetwork?.symbol || 'MATIC')
      setTokenName(currentNetwork?.name || 'Polygon')
    }
  }, [isOpen, currentNetwork, fetchPaymentMethods])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedPaymentMethods.length === 0) {
      alert('Please select at least one payment method')
      return
    }

    setIsSubmitting(true)
    try {
      await createOrder({
        type,
        chainId,
        tokenAddress: tokenAddress || null,
        tokenSymbol,
        tokenName,
        amount,
        pricePerUnit,
        fiatCurrency,
        paymentMethodIds: selectedPaymentMethods,
        minAmount: minAmount || null,
        maxAmount: maxAmount || null,
      })
      onClose()
      // Reset form
      setAmount('')
      setPricePerUnit('')
      setSelectedPaymentMethods([])
      setMinAmount('')
      setMaxAmount('')
    } catch (error: any) {
      alert(error.message || 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const totalPrice = amount && pricePerUnit ? (parseFloat(amount) * parseFloat(pricePerUnit)).toFixed(2) : '0.00'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="megapayer-panel p-8 rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-megapayer-text font-heading">Create Order</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-megapayer-panel-soft transition-colors"
          >
            <CustomIcons.X className="w-5 h-5 text-megapayer-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Type */}
          <div>
            <label className="block text-sm font-semibold text-megapayer-text mb-3">Order Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setType('buy')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                  type === 'buy'
                    ? 'border-megapayer-emerald bg-gradient-to-r from-megapayer-emerald/10 to-megapayer-teal/10'
                    : 'border-megapayer-border bg-megapayer-panel-soft'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CustomIcons.Download className="w-5 h-5 text-megapayer-emerald" />
                  <span className="font-semibold text-megapayer-text">Buy</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType('sell')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                  type === 'sell'
                    ? 'border-megapayer-accent bg-gradient-to-r from-megapayer-accent/10 to-megapayer-violet/10'
                    : 'border-megapayer-border bg-megapayer-panel-soft'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CustomIcons.Send className="w-5 h-5 text-megapayer-accent" />
                  <span className="font-semibold text-megapayer-text">Sell</span>
                </div>
              </button>
            </div>
          </div>

          {/* Chain Selection */}
          <div>
            <label className="block text-sm font-semibold text-megapayer-text mb-2">Blockchain Network</label>
            <select
              value={chainId}
              onChange={(e) => {
                const selectedChainId = parseInt(e.target.value)
                setChainId(selectedChainId)
                const network = networks.find((n) => n.chainId === selectedChainId)
                if (network) {
                  setTokenSymbol(network.symbol)
                  setTokenName(network.name)
                }
              }}
              className="w-full p-3 bg-megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text"
            >
              {networks.map((network) => (
                <option key={network.chainId} value={network.chainId}>
                  {network.name} ({network.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Token Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-megapayer-text mb-2">Token Symbol</label>
              <input
                type="text"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                required
                className="w-full p-3 bg-megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text"
                placeholder="MATIC"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-megapayer-text mb-2">Token Name</label>
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                required
                className="w-full p-3 bg-megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text"
                placeholder="Polygon"
              />
            </div>
          </div>

          {/* Amount and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-megapayer-text mb-2">Amount</label>
              <input
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full p-3 bg-megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text"
                placeholder="100"
              />
              <p className="text-xs text-megapayer-muted mt-1">{tokenSymbol}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-megapayer-text mb-2">Price per Unit</label>
              <input
                type="number"
                step="0.01"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                required
                className="w-full p-3 bg-megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text"
                placeholder="0.50"
              />
              <p className="text-xs text-megapayer-muted mt-1">USD</p>
            </div>
          </div>

          {/* Total Price Display */}
          <div className="p-4 bg-gradient-to-r from-megapayer-teal/10 to-megapayer-violet/10 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-megapayer-text">Total Price</span>
              <span className="text-2xl font-bold text-megapayer-text">${totalPrice} {fiatCurrency}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-semibold text-megapayer-text mb-3">Payment Methods</label>
            {paymentMethods.length > 0 ? (
              <div className="space-y-2">
                {paymentMethods
                  .filter((pm) => pm.isActive)
                  .map((pm) => (
                    <label
                      key={pm.id}
                      className="flex items-center gap-3 p-3 bg-megapayer-panel-soft rounded-xl border border-megapayer-border cursor-pointer hover:border-megapayer-teal/50 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPaymentMethods.includes(pm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPaymentMethods([...selectedPaymentMethods, pm.id])
                          } else {
                            setSelectedPaymentMethods(selectedPaymentMethods.filter((id) => id !== pm.id))
                          }
                        }}
                        className="w-5 h-5 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-megapayer-text capitalize">{pm.type.replace('_', ' ')}</p>
                        {pm.isVerified && (
                          <span className="text-xs text-megapayer-emerald">✓ Verified</span>
                        )}
                      </div>
                    </label>
                  ))}
              </div>
            ) : (
              <div className="p-4 bg-megapayer-panel-soft rounded-xl border border-megapayer-border text-center">
                <p className="text-sm text-megapayer-muted mb-3">No payment methods added</p>
                <a
                  href="/p2p/payment-methods"
                  className="text-sm text-megapayer-teal hover:text-megapayer-teal/80 font-medium"
                >
                  Add Payment Method →
                </a>
              </div>
            )}
          </div>

          {/* Min/Max Amount (Optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-megapayer-text mb-2">
                Min Amount <span className="text-xs text-megapayer-muted">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.0001"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full p-3 bg-megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-megapayer-text mb-2">
                Max Amount <span className="text-xs text-megapayer-muted">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.0001"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full p-3 bg-megapayer-panel-soft border border-megapayer-border rounded-xl text-megapayer-text"
                placeholder="1000"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-megapayer-panel-soft text-megapayer-text rounded-xl font-semibold hover:bg-megapayer-panel transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedPaymentMethods.length === 0}
              className="flex-1 px-6 py-3 megapayer-btn-primary rounded-xl font-semibold disabled:opacity-50 transition-all duration-300"
            >
              {isSubmitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

