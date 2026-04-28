import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-cbc'

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text: string): string {
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encryptedText = parts[1]
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// GET /api/payment-methods
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Decrypt payment details
    const decryptedMethods = paymentMethods.map((method) => ({
      ...method,
      details: typeof method.details === 'object' && method.details !== null
        ? method.details
        : decrypt(JSON.stringify(method.details)),
    }))

    return NextResponse.json({ paymentMethods: decryptedMethods })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment methods' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// POST /api/payment-methods
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { type, details } = body

    if (!type || !details) {
      return NextResponse.json(
        { error: 'Type and details are required' },
        { status: 400 }
      )
    }

    // Encrypt payment details
    const encryptedDetails = encrypt(JSON.stringify(details))

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        type,
        details: encryptedDetails as any,
        isVerified: false,
        isActive: true,
      },
    })

    return NextResponse.json({
      paymentMethod: {
        ...paymentMethod,
        details: details, // Return unencrypted for client
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create payment method' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

