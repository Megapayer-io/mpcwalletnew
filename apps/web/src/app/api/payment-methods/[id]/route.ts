import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
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

// PATCH /api/payment-methods/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: params.id },
    })

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    if (paymentMethod.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updateData: any = {}
    if (body.details !== undefined) {
      updateData.details = encrypt(JSON.stringify(body.details)) as any
    }
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive
    }

    const updated = await prisma.paymentMethod.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      paymentMethod: {
        ...updated,
        details: body.details || updated.details,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update payment method' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// DELETE /api/payment-methods/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: params.id },
    })

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    if (paymentMethod.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.paymentMethod.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete payment method' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// POST /api/payment-methods/:id/verify (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request)

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: params.id },
    })

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.paymentMethod.update({
      where: { id: params.id },
      data: { isVerified: true },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: admin.id,
        actionType: 'payment_method_verify',
        targetType: 'payment_method',
        targetId: params.id,
      },
    })

    return NextResponse.json({ paymentMethod: updated })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment method' },
      { status: error.message === 'Forbidden: Admin access required' ? 403 : 500 }
    )
  }
}

