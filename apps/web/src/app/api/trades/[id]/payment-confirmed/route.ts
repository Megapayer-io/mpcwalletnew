import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/trades/:id/payment-confirmed
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

