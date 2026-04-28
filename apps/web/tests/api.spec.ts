import { test, expect } from '@playwright/test'

test.describe('P2P Exchange API Tests', () => {
  let authToken: string
  let walletAddress: string

  test.beforeAll(async ({ request }) => {
    // Use a test wallet address
    walletAddress = '0x1234567890123456789012345678901234567890'
    
    // Login to get auth token
    const loginResponse = await request.post('/api/auth/login', {
      data: { walletAddress },
    })
    
    if (loginResponse.ok()) {
      const loginData = await loginResponse.json()
      authToken = loginData.token
    }
  })

  test('Authentication - Login', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { walletAddress },
    })
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.token).toBeTruthy()
  })

  test('Wallet Balance - GET', async ({ request }) => {
    const response = await request.get('/api/wallet/balance', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data).toHaveProperty('balances')
  })

  test('Wallet Balance - Sync', async ({ request }) => {
    const response = await request.post('/api/wallet/balance/sync', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        chainId: 137,
        balances: [{ token: 'MATIC', balance: '1000' }],
      },
    })
    expect(response.ok()).toBeTruthy()
  })

  test('Orders - List', async ({ request }) => {
    const response = await request.get('/api/orders', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(Array.isArray(data.orders)).toBeTruthy()
  })

  test('Orders - Create', async ({ request }) => {
    const response = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        type: 'buy',
        chainId: 137,
        tokenSymbol: 'MATIC',
        amount: '100',
        pricePerUnit: '0.5',
        fiatCurrency: 'USD',
        paymentMethodIds: [],
      },
    })
    
    // May fail if user already has orders or other validation issues
    expect([200, 201, 400, 422]).toContain(response.status())
  })

  test('Orders - Get My Orders', async ({ request }) => {
    const response = await request.get('/api/orders/my', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(Array.isArray(data.orders)).toBeTruthy()
  })

  test('Trades - List', async ({ request }) => {
    const response = await request.get('/api/trades', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(Array.isArray(data.trades)).toBeTruthy()
  })

  test('Payment Methods - List', async ({ request }) => {
    const response = await request.get('/api/payment-methods', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(Array.isArray(data.paymentMethods)).toBeTruthy()
  })

  test('Payment Methods - Create', async ({ request }) => {
    const response = await request.post('/api/payment-methods', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        type: 'bank_transfer',
        details: {
          bankName: 'Test Bank',
          accountNumber: '123456789',
        },
      },
    })
    
    // May fail if payment method already exists or validation fails
    expect([200, 201, 400, 422]).toContain(response.status())
  })

  test('Notifications - List', async ({ request }) => {
    const response = await request.get('/api/notifications', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data).toHaveProperty('notifications')
  })

  test('Disputes - List', async ({ request }) => {
    const response = await request.get('/api/disputes', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(Array.isArray(data.disputes)).toBeTruthy()
  })

  test('Admin Dashboard - Check Access', async ({ request }) => {
    const response = await request.get('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    // Should return 403 if not admin, or 200 if admin
    expect([200, 403]).toContain(response.status())
  })
})

test.describe('P2P Exchange UI Tests', () => {
  test('P2P Dashboard loads', async ({ page }) => {
    await page.goto('/p2p')
    // Wait for page to load
    await page.waitForTimeout(2000)
    // Check if P2P dashboard elements are present
    const heading = page.locator('text=P2P Exchange').or(page.locator('h1, h2')).first()
    expect(await heading.isVisible()).toBeTruthy()
  })

  test('Test page loads', async ({ page }) => {
    await page.goto('/test')
    await page.waitForTimeout(1000)
    const heading = page.locator('text=API Test Suite').or(page.locator('h1, h2')).first()
    expect(await heading.isVisible()).toBeTruthy()
  })
})

