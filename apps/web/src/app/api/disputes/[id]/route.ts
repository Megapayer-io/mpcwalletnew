import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/disputes/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
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

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    // Check if user is part of dispute or is admin
    const trade = dispute.trade
    if (!user.isAdmin && trade.buyerId !== user.id && trade.sellerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      dispute,
      messages: dispute.messages,
      trade: dispute.trade,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dispute' },
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

    const { message, attachments } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        trade: {
          select: {
            buyerId: true,
            sellerId: true,
          },
        },
      },
    })

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    // Check if user is part of dispute or is admin
    const trade = dispute.trade
    if (!user.isAdmin && trade.buyerId !== user.id && trade.sellerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const disputeMessage = await prisma.disputeMessage.create({
      data: {
        disputeId: params.id,
        senderId: user.id,
        message,
        attachments: attachments ? attachments as any : null,
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

    // Notify parties
    const recipientId = trade.buyerId === user.id ? trade.sellerId : trade.buyerId
    await Promise.all([
      recipientId && prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'dispute',
          title: 'New Dispute Message',
          message: `You have a new message in dispute #${params.id.substring(0, 8)}`,
          link: `/disputes/${params.id}`,
        },
      }),
    ])

    return NextResponse.json({ message: disputeMessage })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// POST /api/disputes/:id/resolve (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request)
    const body = await request.json()

    const { resolution, winnerId } = body

    if (!resolution) {
      return NextResponse.json(
        { error: 'Resolution is required' },
        { status: 400 }
      )
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        trade: true,
      },
    })

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      return NextResponse.json(
        { error: 'Dispute already resolved' },
        { status: 400 }
      )
    }

    const updatedDispute = await prisma.dispute.update({
      where: { id: params.id },
      data: {
        status: 'resolved',
        adminId: admin.id,
        resolution,
        resolvedAt: new Date(),
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
        admin: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
          },
        },
      },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: admin.id,
        actionType: 'dispute_resolve',
        targetType: 'dispute',
        targetId: params.id,
        details: {
          resolution,
          winnerId,
        } as any,
      },
    })

    // Create notifications
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: dispute.trade.buyerId,
          type: 'dispute',
          title: 'Dispute Resolved',
          message: `Dispute #${params.id.substring(0, 8)} has been resolved`,
          link: `/disputes/${params.id}`,
        },
      }),
      prisma.notification.create({
        data: {
          userId: dispute.trade.sellerId,
          type: 'dispute',
          title: 'Dispute Resolved',
          message: `Dispute #${params.id.substring(0, 8)} has been resolved`,
          link: `/disputes/${params.id}`,
        },
      }),
    ])

    return NextResponse.json({ dispute: updatedDispute })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to resolve dispute' },
      { status: error.message === 'Forbidden: Admin access required' ? 403 : 500 }
    )
  }
}

