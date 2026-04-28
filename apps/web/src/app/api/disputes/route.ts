import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/disputes
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    // If user is admin, show all disputes. Otherwise, show only user's disputes
    if (!user.isAdmin) {
      where.trade = {
        OR: [
          { buyerId: user.id },
          { sellerId: user.id },
        ],
      }
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        include: {
          trade: {
            include: {
              buyer: {
                select: {
                  id: true,
                  walletAddress: true,
                  username: true,
                },
              },
              seller: {
                select: {
                  id: true,
                  walletAddress: true,
                  username: true,
                },
              },
            },
          },
          initiatedByUser: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
            },
          },
          admin: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.dispute.count({ where }),
    ])

    return NextResponse.json({
      disputes,
      total,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch disputes' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// POST /api/trades/:id/dispute
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { reason, description } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Reason is required' },
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
        { error: 'Cannot create dispute for completed or cancelled trade' },
        { status: 400 }
      )
    }

    // Check if dispute already exists
    const existingDispute = await prisma.dispute.findUnique({
      where: { tradeId: params.id },
    })

    if (existingDispute) {
      return NextResponse.json(
        { error: 'Dispute already exists for this trade' },
        { status: 400 }
      )
    }

    const dispute = await prisma.dispute.create({
      data: {
        tradeId: params.id,
        initiatedBy: user.id,
        reason,
        description: description || null,
        status: 'open',
      },
      include: {
        trade: {
          include: {
            buyer: {
              select: {
                id: true,
                walletAddress: true,
                username: true,
              },
            },
            seller: {
              select: {
                id: true,
                walletAddress: true,
                username: true,
              },
            },
          },
        },
        initiatedByUser: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
          },
        },
      },
    })

    // Update trade status
    await prisma.trade.update({
      where: { id: params.id },
      data: { status: 'disputed' },
    })

    // Create notifications
    const recipientId = trade.buyerId === user.id ? trade.sellerId : trade.buyerId
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'dispute',
          title: 'Dispute Opened',
          message: `A dispute has been opened for trade #${params.id.substring(0, 8)}`,
          link: `/disputes/${dispute.id}`,
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'dispute',
          title: 'Dispute Opened',
          message: `Your dispute for trade #${params.id.substring(0, 8)} has been opened`,
          link: `/disputes/${dispute.id}`,
        },
      }),
    ])

    return NextResponse.json({ dispute })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create dispute' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

