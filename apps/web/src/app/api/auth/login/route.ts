import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/auth/login
// Note: This uses wallet authentication - the wallet should provide a signed message
// For now, we'll create/get user by wallet address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, signature } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // In production, verify the signature here
    // For now, we'll just get or create the user

    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        isAdmin: true,
      },
    })

    let authUser
    if (user) {
      authUser = user
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          walletAddress,
          isVerified: false,
          verificationLevel: 'basic',
          reputationScore: 5.0,
        },
        select: {
          id: true,
          walletAddress: true,
          username: true,
          email: true,
          isAdmin: true,
        },
      })
      authUser = newUser
    }

    // Generate token
    const { generateToken } = await import('@/lib/auth')
    const token = generateToken(authUser)

    return NextResponse.json({
      token,
      user: authUser,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    )
  }
}

