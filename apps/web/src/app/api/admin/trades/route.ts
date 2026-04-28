import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/trades
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
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
          order: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.trade.count({ where }),
    ])

    return NextResponse.json({
      trades,
      total,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trades' },
      { status: error.message === 'Forbidden: Admin access required' ? 403 : 500 }
    )
  }
}

// POST /api/admin/trades/:id/release-escrow
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request)

    const trade = await prisma.trade.findUnique({
      where: { id: params.id },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.status !== 'escrow_locked' && trade.status !== 'payment_confirmed') {
      return NextResponse.json(
        { error: 'Trade is not in escrow state' },
        { status: 400 }
      )
    }

    // Update trade status (in production, this would call the escrow smart contract)
    const updatedTrade = await prisma.trade.update({
      where: { id: params.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
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
        order: true,
      },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: admin.id,
        actionType: 'escrow_release',
        targetType: 'trade',
        targetId: params.id,
      },
    })

    return NextResponse.json({ trade: updatedTrade })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to release escrow' },
      { status: error.message === 'Forbidden: Admin access required' ? 403 : 500 }
    )
  }
}

