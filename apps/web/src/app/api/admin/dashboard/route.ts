import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/dashboard
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)

    const [
      totalUsers,
      totalTrades,
      activeOrders,
      openDisputes,
      trades,
      disputes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.trade.count(),
      prisma.order.count({ where: { status: 'active' } }),
      prisma.dispute.count({ where: { status: 'open' } }),
      prisma.trade.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.dispute.findMany({
        where: { status: 'open' },
        take: 10,
        orderBy: { createdAt: 'desc' },
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
        },
      }),
    ])

    // Calculate total volume (simplified - would need more complex aggregation in production)
    const completedTrades = await prisma.trade.findMany({
      where: { status: 'completed' },
      select: {
        totalPrice: true,
        fiatCurrency: true,
        chainId: true,
      },
    })

    const totalVolume = completedTrades.reduce((acc, trade) => {
      const price = parseFloat(trade.totalPrice)
      return acc + price
    }, 0)

    const volumeByChain = completedTrades.reduce((acc, trade) => {
      const chainId = trade.chainId.toString()
      const price = parseFloat(trade.totalPrice)
      acc[chainId] = (acc[chainId] || 0) + price
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      totalUsers,
      totalTrades,
      activeOrders,
      activeTrades: await prisma.trade.count({ where: { status: { in: ['pending', 'escrow_locked', 'payment_pending', 'payment_confirmed'] } } }),
      openDisputes,
      totalVolume: {
        usd: totalVolume.toString(),
        byChain: Object.entries(volumeByChain).map(([chainId, usd]) => ({
          chainId: parseInt(chainId),
          usd: usd.toString(),
        })),
      },
      recentTrades: trades,
      recentDisputes: disputes,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: error.message === 'Forbidden: Admin access required' ? 403 : 500 }
    )
  }
}

