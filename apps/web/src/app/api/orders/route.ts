import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'buy' or 'sell'
    const chainId = searchParams.get('chainId')
    const tokenSymbol = searchParams.get('tokenSymbol')
    const status = searchParams.get('status') || 'active'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      status: status === 'all' ? undefined : status,
    }

    if (type) where.type = type
    if (chainId) where.chainId = parseInt(chainId)
    if (tokenSymbol) where.tokenSymbol = tokenSymbol

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
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
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const {
      type,
      chainId,
      tokenAddress,
      tokenSymbol,
      tokenName,
      amount,
      pricePerUnit,
      fiatCurrency,
      paymentMethodIds,
      minAmount,
      maxAmount,
      expiresAt,
    } = body

    // Validate required fields
    if (!type || !chainId || !tokenSymbol || !amount || !pricePerUnit || !paymentMethodIds) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate total price
    const totalPrice = (parseFloat(amount) * parseFloat(pricePerUnit)).toString()

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        type,
        chainId,
        tokenAddress: tokenAddress || null,
        tokenSymbol,
        tokenName: tokenName || tokenSymbol,
        amount,
        pricePerUnit,
        totalPrice,
        fiatCurrency: fiatCurrency || 'USD',
        paymentMethodIds,
        minAmount: minAmount || null,
        maxAmount: maxAmount || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: 'active',
      },
      include: {
        user: {
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
      },
    })

    return NextResponse.json({ order })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

