import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/disputes
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
      { status: error.message === 'Forbidden: Admin access required' ? 403 : 500 }
    )
  }
}

