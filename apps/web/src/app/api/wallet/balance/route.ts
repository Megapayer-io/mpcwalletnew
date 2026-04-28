import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/wallet/balance
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const chainId = request.nextUrl.searchParams.get('chainId')

    if (chainId) {
      // Get balance for specific chain
      const balances = await prisma.userBalance.findMany({
        where: {
          userId: user.id,
          chainId: parseInt(chainId),
        },
        select: {
          chainId: true,
          tokenAddress: true,
          tokenSymbol: true,
          balance: true,
          usdValue: true,
        },
      })

      return NextResponse.json({
        chainId: parseInt(chainId),
        balances: balances.map((b) => ({
          tokenAddress: b.tokenAddress,
          symbol: b.tokenSymbol,
          balance: b.balance,
          usdValue: b.usdValue,
        })),
      })
    } else {
      // Get balances for all chains
      const balances = await prisma.userBalance.findMany({
        where: {
          userId: user.id,
        },
        select: {
          chainId: true,
          tokenAddress: true,
          tokenSymbol: true,
          balance: true,
          usdValue: true,
        },
      })

      return NextResponse.json({
        balances: balances.map((b) => ({
          chainId: b.chainId,
          tokenAddress: b.tokenAddress,
          symbol: b.tokenSymbol,
          balance: b.balance,
          usdValue: b.usdValue,
        })),
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balance' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}


