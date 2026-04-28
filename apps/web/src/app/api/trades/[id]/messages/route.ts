import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/trades/:id/messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Verify user is part of trade
    const trade = await prisma.trade.findUnique({
      where: { id: params.id },
      select: { buyerId: true, sellerId: true },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.buyerId !== user.id && trade.sellerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const [messages, total] = await Promise.all([
      prisma.tradeMessage.findMany({
        where: { tradeId: params.id },
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
        take: limit,
        skip: offset,
      }),
      prisma.tradeMessage.count({
        where: { tradeId: params.id },
      }),
    ])

    return NextResponse.json({
      messages,
      total,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// POST /api/trades/:id/messages
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { message, messageType } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Verify user is part of trade
    const trade = await prisma.trade.findUnique({
      where: { id: params.id },
      select: { buyerId: true, sellerId: true, status: true },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.buyerId !== user.id && trade.sellerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (trade.status === 'completed' || trade.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot send messages to completed or cancelled trade' },
        { status: 400 }
      )
    }

    const tradeMessage = await prisma.tradeMessage.create({
      data: {
        tradeId: params.id,
        senderId: user.id,
        message,
        messageType: messageType || 'text',
      },
      include: {
        sender: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
          },
        },
      },
    })

    // Notify the other party
    const recipientId = trade.buyerId === user.id ? trade.sellerId : trade.buyerId
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'message',
        title: 'New Message',
        message: `You have a new message in trade #${params.id.substring(0, 8)}`,
        link: `/trades/${params.id}`,
      },
    })

    return NextResponse.json({ message: tradeMessage })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// PUT /api/trades/:id/messages/:messageId/read
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const user = await requireAuth(request)

    // Verify user is part of trade
    const trade = await prisma.trade.findUnique({
      where: { id: params.id },
      select: { buyerId: true, sellerId: true },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.buyerId !== user.id && trade.sellerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.tradeMessage.update({
      where: { id: params.messageId },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to mark message as read' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

