import { prisma } from './db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Comma-separated list of wallet addresses that should be granted admin on login.
// Compared case-insensitively. Set ADMIN_WALLET_ADDRESSES in Vercel env vars.
export function isWalletInAdminList(walletAddress: string): boolean {
  const raw = process.env.ADMIN_WALLET_ADDRESSES
  if (!raw) return false
  const target = walletAddress.toLowerCase()
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(target)
}

export interface AuthUser {
  id: string
  walletAddress: string
  username?: string | null
  email?: string | null
  isAdmin: boolean
}

export interface AuthRequest extends Request {
  user?: AuthUser
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      walletAddress: user.walletAddress,
      isAdmin: user.isAdmin,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Verify JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      walletAddress: string
      isAdmin: boolean
    }
    return {
      id: decoded.id,
      walletAddress: decoded.walletAddress,
      isAdmin: decoded.isAdmin,
    }
  } catch (error) {
    return null
  }
}

// Get user from wallet address (create if doesn't exist)
export async function getUserByWalletAddress(walletAddress: string): Promise<AuthUser | null> {
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

  if (!user) {
    // Create user if doesn't exist (wallet integration)
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
    return newUser
  }

  return user
}

// Middleware to authenticate requests
export async function authenticateRequest(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  // Verify user still exists and is not suspended
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      walletAddress: true,
      username: true,
      email: true,
      isAdmin: true,
      isSuspended: true,
      suspendedUntil: true,
    },
  })

  if (!user || user.isSuspended) {
    if (user?.suspendedUntil && new Date() > user.suspendedUntil) {
      // Suspension expired, update user
      await prisma.user.update({
        where: { id: user.id },
        data: { isSuspended: false, suspendedUntil: null },
      })
      return {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      }
    }
    return null
  }

  // Auto-promote wallets listed in ADMIN_WALLET_ADDRESSES env var to admin.
  let isAdmin = user.isAdmin
  if (isWalletInAdminList(user.walletAddress) && !isAdmin) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true },
    })
    isAdmin = true
  }

  return {
    id: user.id,
    walletAddress: user.walletAddress,
    username: user.username,
    email: user.email,
    isAdmin,
  }
}

// Middleware helper for Next.js API routes
export async function requireAuth(request: Request): Promise<AuthUser> {
  const user = await authenticateRequest(request)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

// Middleware helper for admin routes
export async function requireAdmin(request: Request): Promise<AuthUser> {
  const user = await authenticateRequest(request)
  if (!user || !user.isAdmin) {
    throw new Error('Forbidden: Admin access required')
  }
  return user
}

