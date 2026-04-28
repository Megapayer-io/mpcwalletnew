import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/trades/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const trade = await prisma.trade.findUnique({
      where: { id: params.id },
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
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                walletAddress: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // Check if user is part of this trade
    if (trade.buyerId !== user.id && trade.sellerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ trade, messages: trade.messages, order: trade.order })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trade' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// POST /api/trades/:id/payment-confirmed
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const trade = await prisma.trade.findUnique({
      where: { id: params.id },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.buyerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (trade.buyerPaymentConfirmed) {
      return NextResponse.json({ error: 'Payment already confirmed' }, { status: 400 })
    }

    const updatedTrade = await prisma.trade.update({
      where: { id: params.id },
      data: {
        buyerPaymentConfirmed: true,
        buyerConfirmedAt: new Date(),
        status: trade.status === 'escrow_locked' ? 'payment_pending' : trade.status,
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
      },
    })

    // Create system message
    await prisma.tradeMessage.create({
      data: {
        tradeId: params.id,
        senderId: user.id,
        message: 'Buyer confirmed payment sent',
        messageType: 'payment_confirmation',
      },
    })

    return NextResponse.json({ trade: updatedTrade })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to confirm payment' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// POST /api/trades/:id/cancel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const trade = await prisma.trade.findUnique({
      where: { id: params.id },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.buyerId !== user.id && trade.sellerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (trade.status === 'completed' || trade.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot cancel completed or cancelled trade' },
        { status: 400 }
      )
    }

    const updatedTrade = await prisma.trade.update({
      where: { id: params.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: body.reason || null,
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
      },
    })

    // Update user stats
    await Promise.all([
      prisma.user.update({
        where: { id: trade.buyerId },
        data: {
          cancelledTrades: { increment: 1 },
        },
      }),
      prisma.user.update({
        where: { id: trade.sellerId },
        data: {
          cancelledTrades: { increment: 1 },
        },
      }),
    ])

    return NextResponse.json({ trade: updatedTrade })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to cancel trade' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

