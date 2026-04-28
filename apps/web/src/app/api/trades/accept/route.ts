import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/trades/accept
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { orderId, paymentMethodId, amount } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot accept your own order' },
        { status: 400 }
      )
    }

    if (order.status !== 'active') {
      return NextResponse.json(
        { error: 'Order is not active' },
        { status: 400 }
      )
    }

    // Validate amount
    const tradeAmount = amount || order.amount
    if (order.minAmount && parseFloat(tradeAmount) < parseFloat(order.minAmount)) {
      return NextResponse.json(
        { error: `Amount must be at least ${order.minAmount}` },
        { status: 400 }
      )
    }
    if (order.maxAmount && parseFloat(tradeAmount) > parseFloat(order.maxAmount)) {
      return NextResponse.json(
        { error: `Amount must be at most ${order.maxAmount}` },
        { status: 400 }
      )
    }

    // Determine buyer and seller
    const buyerId = order.type === 'buy' ? order.userId : user.id
    const sellerId = order.type === 'buy' ? user.id : order.userId

    // Calculate prices
    const pricePerUnit = order.pricePerUnit
    const totalPrice = (parseFloat(tradeAmount) * parseFloat(pricePerUnit)).toString()

    // Create trade
    const trade = await prisma.trade.create({
      data: {
        orderId: order.id,
        buyerId,
        sellerId,
        chainId: order.chainId,
        tokenAddress: order.tokenAddress || '',
        tokenSymbol: order.tokenSymbol,
        amount: tradeAmount,
        pricePerUnit,
        totalPrice,
        fiatCurrency: order.fiatCurrency,
        paymentMethodId: paymentMethodId || null,
        status: 'pending',
      },
      include: {
        buyer: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            reputationScore: true,
            totalTrades: true,
            completedTrades: true,
            isVerified: true,
          },
        },
        seller: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            reputationScore: true,
            totalTrades: true,
            completedTrades: true,
            isVerified: true,
          },
        },
        order: true,
        paymentMethod: true,
      },
    })

    // Create welcome message
    await prisma.tradeMessage.create({
      data: {
        tradeId: trade.id,
        senderId: user.id,
        message: 'Trade started',
        messageType: 'system',
      },
    })

    // Create notifications
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: buyerId,
          type: 'trade_update',
          title: 'New Trade Started',
          message: `Trade #${trade.id.substring(0, 8)} has been created`,
          link: `/trades/${trade.id}`,
        },
      }),
      prisma.notification.create({
        data: {
          userId: sellerId,
          type: 'trade_update',
          title: 'New Trade Started',
          message: `Trade #${trade.id.substring(0, 8)} has been created`,
          link: `/trades/${trade.id}`,
        },
      }),
    ])

    return NextResponse.json({ trade })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to accept order' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

