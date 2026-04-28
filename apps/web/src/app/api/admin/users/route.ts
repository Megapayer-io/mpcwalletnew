import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (search) {
      where.OR = [
        { walletAddress: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          walletAddress: true,
          username: true,
          email: true,
          createdAt: true,
          isVerified: true,
          verificationLevel: true,
          reputationScore: true,
          totalTrades: true,
          completedTrades: true,
          cancelledTrades: true,
          disputeRate: true,
          isAdmin: true,
          isSuspended: true,
          suspendedUntil: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      total,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: error.message === 'Forbidden: Admin access required' ? 403 : 500 }
    )
  }
}


