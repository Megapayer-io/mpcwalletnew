import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/admin/users/:id/suspend
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request)
    const body = await request.json()

    const { reason, duration } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const suspendedUntil = duration
      ? new Date(Date.now() + duration * 1000)
      : null

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        isSuspended: true,
        suspendedUntil,
      },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: admin.id,
        actionType: 'user_suspend',
        targetType: 'user',
        targetId: params.id,
        details: {
          reason,
          duration,
          suspendedUntil: suspendedUntil?.toISOString(),
        } as any,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to suspend user' },
      { status: error.message === 'Forbidden: Admin access required' ? 403 : 500 }
    )
  }
}

