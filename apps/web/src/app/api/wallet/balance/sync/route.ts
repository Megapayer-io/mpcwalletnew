import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/wallet/balance/sync
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { balances } = body as {
      balances: Array<{
        chainId: number
        tokenAddress: string | null
        tokenSymbol: string
        balance: string
        usdValue?: string
      }>
    }

    // Update or create balances
    const updatedBalances = await Promise.all(
      balances.map(async (balance) => {
        return prisma.userBalance.upsert({
          where: {
            userId_chainId_tokenAddress: {
              userId: user.id,
              chainId: balance.chainId,
              tokenAddress: balance.tokenAddress || null,
            },
          },
          update: {
            balance: balance.balance,
            usdValue: balance.usdValue || null,
            tokenSymbol: balance.tokenSymbol,
            lastUpdated: new Date(),
          },
          create: {
            userId: user.id,
            chainId: balance.chainId,
            tokenAddress: balance.tokenAddress || null,
            tokenSymbol: balance.tokenSymbol,
            balance: balance.balance,
            usdValue: balance.usdValue || null,
          },
        })
      })
    )

    return NextResponse.json({
      success: true,
      balances: updatedBalances.map((b) => ({
        chainId: b.chainId,
        tokenAddress: b.tokenAddress,
        symbol: b.tokenSymbol,
        balance: b.balance,
        usdValue: b.usdValue,
      })),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sync balance' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

