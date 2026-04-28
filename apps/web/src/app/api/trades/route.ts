import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/trades
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      OR: [
        { buyerId: user.id },
        { sellerId: user.id },
      ],
    }

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
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

