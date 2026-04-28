import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/trades/:id/payment-received
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const trade = await prisma.trade.findUnique({
      where: { id: params.id },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.sellerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (trade.sellerPaymentConfirmed) {
      return NextResponse.json({ error: 'Payment already confirmed' }, { status: 400 })
    }

    const updatedTrade = await prisma.trade.update({
      where: { id: params.id },
      data: {
        sellerPaymentConfirmed: true,
        sellerConfirmedAt: new Date(),
        status: trade.buyerPaymentConfirmed ? 'completed' : 'payment_confirmed',
        completedAt: trade.buyerPaymentConfirmed ? new Date() : null,
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

    // Update user stats if trade completed
    if (updatedTrade.status === 'completed') {
      await Promise.all([
        prisma.user.update({
          where: { id: trade.buyerId },
          data: {
            totalTrades: { increment: 1 },
            completedTrades: { increment: 1 },
          },
        }),
        prisma.user.update({
          where: { id: trade.sellerId },
          data: {
            totalTrades: { increment: 1 },
            completedTrades: { increment: 1 },
          },
        }),
      ])
    }

    // Create system message
    await prisma.tradeMessage.create({
      data: {
        tradeId: params.id,
        senderId: user.id,
        message: 'Seller confirmed payment received',
        messageType: 'payment_confirmation',
      },
    })

    return NextResponse.json({ trade: updatedTrade })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to confirm payment received' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

