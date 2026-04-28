import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/disputes/:id/messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
    })

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    // Check if user is part of dispute or is admin
    const trade = await prisma.trade.findUnique({
      where: { id: dispute.tradeId },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.buyerId !== user.id && trade.sellerId !== user.id && !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const messages = await prisma.disputeMessage.findMany({
      where: { disputeId: params.id },
      include: {
        sender: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            isAdmin: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ messages })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// POST /api/disputes/:id/messages
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
    })

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    // Check if user is part of dispute or is admin
    const trade = await prisma.trade.findUnique({
      where: { id: dispute.tradeId },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.buyerId !== user.id && trade.sellerId !== user.id && !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const message = await prisma.disputeMessage.create({
      data: {
        disputeId: params.id,
        senderId: user.id,
        message: body.message,
      },
      include: {
        sender: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            isAdmin: true,
          },
        },
      },
    })

    return NextResponse.json({ message })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

