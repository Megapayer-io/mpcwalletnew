import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/analytics
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)

    const [
      totalUsers,
      activeUsers,
      totalTrades,
      completedTrades,
      resolvedDisputes,
      disputeData,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.trade.count(),
      prisma.trade.count({ where: { status: 'completed' } }),
      prisma.dispute.count({ where: { status: 'resolved' } }),
      // Calculate average resolution time
      prisma.dispute.findMany({
        where: {
          status: 'resolved',
          resolvedAt: { not: null },
        },
        select: {
          createdAt: true,
          resolvedAt: true,
        },
      }),
    ])

    const disputes = await prisma.dispute.count()
    const openDisputes = await prisma.dispute.count({ where: { status: 'open' } })

    // Calculate average dispute resolution time
    const resolutionTimes = disputeData
      .filter((d) => d.resolvedAt)
      .map((d) => {
        const created = new Date(d.createdAt).getTime()
        const resolved = new Date(d.resolvedAt!).getTime()
        return resolved - created
      })

    const avgResolutionTime =
      resolutionTimes.length > 0
        ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        : 0

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      trades: {
        total: totalTrades,
        completed: completedTrades,
      },
      disputes: {
        total: disputes,
        open: openDisputes,
        resolved: resolvedDisputes,
        avgResolutionTimeMs: avgResolutionTime,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: error.message === 'Forbidden: Admin access required' ? 403 : 500 }
    )
  }
}

