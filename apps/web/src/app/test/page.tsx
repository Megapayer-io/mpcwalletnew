'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletStore } from '@/store/wallet'
import { useP2PStore } from '@/store/p2p'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  message?: string
  duration?: number
  data?: any
}

export default function TestPage() {
  const router = useRouter()
  // Use direct store access instead of reactive subscription to prevent auto-locking
  const getWalletState = () => {
    const store = useWalletStore.getState()
    return {
      address: store.address,
      isUnlocked: store.isUnlocked,
    }
  }
  
  const { authToken, login } = useP2PStore()
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [summary, setSummary] = useState({ passed: 0, failed: 0, total: 0 })
  const [walletState, setWalletState] = useState<{ address: string | null; isUnlocked: boolean } | null>(null)
  
  // Only check wallet state when user explicitly requests it, not on mount
  const checkWalletState = () => {
    setWalletState(getWalletState())
  }

  // Don't automatically login - let user control when to login
  const handleLogin = async () => {
    const currentState = getWalletState()
    if (!currentState.isUnlocked || !currentState.address) {
      alert('Please unlock your wallet first')
      router.push('/unlock')
      return
    }
    try {
      await login(currentState.address)
      setWalletState(getWalletState())
    } catch (error) {
      alert('Failed to login: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests((prev) => {
      const newTests = [...prev]
      newTests[index] = { ...newTests[index], ...updates }
      return newTests
    })
  }

  const runTest = async (testName: string, testFn: () => Promise<any>, index: number) => {
    const startTime = Date.now()
    updateTest(index, { status: 'running' })

    try {
      const result = await testFn()
      const duration = Date.now() - startTime
      updateTest(index, {
        status: 'passed',
        message: 'Test passed',
        duration,
        data: result,
      })
      return { passed: true, duration }
    } catch (error: any) {
      const duration = Date.now() - startTime
      updateTest(index, {
        status: 'failed',
        message: error.message || 'Test failed',
        duration,
        data: error,
      })
      return { passed: false, duration }
    }
  }

  const runAllTests = async () => {
    if (!authToken) {
      alert('Please unlock your wallet first to run tests')
      return
    }

    setIsRunning(true)
    setSummary({ passed: 0, failed: 0, total: 0 })

    // Initialize test results
    const testDefinitions = [
      { name: 'Authentication - Login', fn: testLogin },
      { name: 'Wallet Balance - GET', fn: testGetBalance },
      { name: 'Wallet Balance - Sync', fn: testSyncBalance },
      { name: 'Orders - List', fn: testListOrders },
      { name: 'Orders - Create', fn: testCreateOrder },
      { name: 'Orders - Get My Orders', fn: testGetMyOrders },
      { name: 'Trades - List', fn: testListTrades },
      { name: 'Payment Methods - List', fn: testListPaymentMethods },
      { name: 'Payment Methods - Create', fn: testCreatePaymentMethod },
      { name: 'Notifications - List', fn: testListNotifications },
      { name: 'Disputes - List', fn: testListDisputes },
      { name: 'Admin - Dashboard', fn: testAdminDashboard },
    ]

    setTests(
      testDefinitions.map((t) => ({
        name: t.name,
        status: 'pending' as const,
      }))
    )

    let passed = 0
    let failed = 0

    // Run tests sequentially
    for (let i = 0; i < testDefinitions.length; i++) {
      const result = await runTest(testDefinitions[i].name, testDefinitions[i].fn, i)
      if (result.passed) {
        passed++
      } else {
        failed++
      }
      await new Promise((resolve) => setTimeout(resolve, 500)) // Small delay between tests
    }

    setSummary({ passed, failed, total: testDefinitions.length })
    setIsRunning(false)
  }

  // Test functions
  const testLogin = async () => {
    const currentState = getWalletState()
    if (!currentState.address) throw new Error('No wallet address')
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: currentState.address }),
    })
    if (!response.ok) throw new Error(`Login failed: ${response.status}`)
    const data = await response.json()
    if (!data.token) throw new Error('No token received')
    return data
  }

  const testGetBalance = async () => {
    const response = await fetch('/api/wallet/balance', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!response.ok) throw new Error(`Get balance failed: ${response.status}`)
    return await response.json()
  }

  const testSyncBalance = async () => {
    const response = await fetch('/api/wallet/balance/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        chainId: 137,
        balances: [{ token: 'MATIC', balance: '1000' }],
      }),
    })
    if (!response.ok) throw new Error(`Sync balance failed: ${response.status}`)
    return await response.json()
  }

  const testListOrders = async () => {
    const response = await fetch('/api/orders', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!response.ok) throw new Error(`List orders failed: ${response.status}`)
    return await response.json()
  }

  const testCreateOrder = async () => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        type: 'buy',
        chainId: 137,
        tokenSymbol: 'MATIC',
        amount: '100',
        pricePerUnit: '0.5',
        fiatCurrency: 'USD',
        paymentMethodIds: [],
      }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Create order failed: ${response.status} - ${error.error}`)
    }
    return await response.json()
  }

  const testGetMyOrders = async () => {
    const response = await fetch('/api/orders/my', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!response.ok) throw new Error(`Get my orders failed: ${response.status}`)
    return await response.json()
  }

  const testListTrades = async () => {
    const response = await fetch('/api/trades', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!response.ok) throw new Error(`List trades failed: ${response.status}`)
    return await response.json()
  }

  const testListPaymentMethods = async () => {
    const response = await fetch('/api/payment-methods', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!response.ok) throw new Error(`List payment methods failed: ${response.status}`)
    return await response.json()
  }

  const testCreatePaymentMethod = async () => {
    const response = await fetch('/api/payment-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        type: 'bank_transfer',
        details: {
          bankName: 'Test Bank',
          accountNumber: '123456789',
        },
      }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Create payment method failed: ${response.status} - ${error.error}`)
    }
    return await response.json()
  }

  const testListNotifications = async () => {
    const response = await fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!response.ok) throw new Error(`List notifications failed: ${response.status}`)
    return await response.json()
  }

  const testListDisputes = async () => {
    const response = await fetch('/api/disputes', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!response.ok) throw new Error(`List disputes failed: ${response.status}`)
    return await response.json()
  }

  const testAdminDashboard = async () => {
    const response = await fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!response.ok) {
      // This is expected if user is not admin
      if (response.status === 403) {
        return { message: 'Not an admin (expected)' }
      }
      throw new Error(`Admin dashboard failed: ${response.status}`)
    }
    return await response.json()
  }

  return (
    <div className="min-h-screen megapayer-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-megapayer-text font-heading">API Tests</h1>
          <p className="text-megapayer-muted mt-1">Browser-based API testing</p>
        </div>
        <div className="space-y-6">
        {/* Header */}
        <div className="megapayer-panel p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-megapayer-text font-heading">API Test Suite</h2>
              <p className="text-megapayer-muted mt-1">
                Run comprehensive API tests in your browser
              </p>
            </div>
            <button
              onClick={runAllTests}
              disabled={isRunning || !authToken}
              className="px-6 py-3 megapayer-btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>

          {/* Summary */}
          {summary.total > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-4 bg-megapayer-panel-soft rounded-xl">
                <p className="text-2xl font-bold text-megapayer-text">{summary.total}</p>
                <p className="text-sm text-megapayer-muted">Total Tests</p>
              </div>
              <div className="text-center p-4 bg-megapayer-emerald/20 rounded-xl">
                <p className="text-2xl font-bold text-megapayer-emerald">{summary.passed}</p>
                <p className="text-sm text-megapayer-muted">Passed</p>
              </div>
              <div className="text-center p-4 bg-red-500/20 rounded-xl">
                <p className="text-2xl font-bold text-red-500">{summary.failed}</p>
                <p className="text-sm text-megapayer-muted">Failed</p>
              </div>
            </div>
          )}

          {!authToken && (
            <div className="mt-4 p-4 bg-megapayer-accent/20 text-megapayer-accent rounded-xl">
              <p className="text-sm mb-2">⚠️ Please unlock your wallet and login to run tests</p>
              <p className="text-xs mb-3 text-megapayer-muted">
                Note: If your wallet was locked automatically, it may be due to session expiration. 
                This is normal security behavior. Please unlock your wallet first.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={checkWalletState}
                  className="px-4 py-2 bg-megapayer-panel-soft text-megapayer-text rounded-lg hover:bg-megapayer-panel transition-all duration-300 text-sm font-medium"
                >
                  Check Wallet Status
                </button>
                {walletState && !walletState.isUnlocked ? (
                  <button
                    onClick={() => router.push('/unlock')}
                    className="px-4 py-2 bg-megapayer-accent/20 text-megapayer-accent rounded-lg hover:bg-megapayer-accent/30 transition-all duration-300 text-sm font-medium"
                  >
                    Go to Unlock Page
                  </button>
                ) : walletState && walletState.isUnlocked ? (
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 bg-megapayer-accent/20 text-megapayer-accent rounded-lg hover:bg-megapayer-accent/30 transition-all duration-300 text-sm font-medium"
                  >
                    Login to P2P
                  </button>
                ) : null}
              </div>
              {walletState && walletState.address && (
                <p className="text-xs mt-2 text-megapayer-muted">
                  Wallet: {walletState.address.slice(0, 6)}...{walletState.address.slice(-4)} | Status: {walletState.isUnlocked ? 'Unlocked' : 'Locked'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="megapayer-panel p-6 animate-fade-in-up">
          <h3 className="text-xl font-bold text-megapayer-text font-heading mb-6">Test Results</h3>

          {tests.length === 0 ? (
            <div className="text-center py-12 text-megapayer-muted">
              <p>Click "Run All Tests" to start testing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    test.status === 'passed'
                      ? 'bg-megapayer-emerald/10 border-megapayer-emerald/50'
                      : test.status === 'failed'
                      ? 'bg-red-500/10 border-red-500/50'
                      : test.status === 'running'
                      ? 'bg-megapayer-accent/10 border-megapayer-accent/50'
                      : 'bg-megapayer-panel-soft border-megapayer-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {test.status === 'running' && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-megapayer-teal"></div>
                      )}
                      {test.status === 'passed' && (
                        <div className="w-5 h-5 rounded-full bg-megapayer-emerald flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      {test.status === 'failed' && (
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                          <span className="text-white text-xs">✗</span>
                        </div>
                      )}
                      {test.status === 'pending' && (
                        <div className="w-5 h-5 rounded-full bg-megapayer-muted/50"></div>
                      )}
                      <div>
                        <p className="font-semibold text-megapayer-text">{test.name}</p>
                        {test.message && (
                          <p
                            className={`text-sm mt-1 ${
                              test.status === 'passed'
                                ? 'text-megapayer-emerald'
                                : test.status === 'failed'
                                ? 'text-red-500'
                                : 'text-megapayer-muted'
                            }`}
                          >
                            {test.message}
                          </p>
                        )}
                        {test.duration && (
                          <p className="text-xs text-megapayer-muted mt-1">
                            Duration: {test.duration}ms
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {test.data && test.status === 'passed' && (
                    <details className="mt-3">
                      <summary className="text-sm text-megapayer-muted cursor-pointer">
                        View Response Data
                      </summary>
                      <pre className="mt-2 p-3 bg-megapayer-panel-soft rounded-lg text-xs overflow-auto max-h-40">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </details>
                  )}
                  {test.data && test.status === 'failed' && (
                    <details className="mt-3">
                      <summary className="text-sm text-red-500 cursor-pointer">View Error Details</summary>
                      <pre className="mt-2 p-3 bg-red-500/10 rounded-lg text-xs overflow-auto max-h-40 text-red-500">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

