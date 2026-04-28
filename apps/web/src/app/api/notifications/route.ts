import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/notifications
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const searchParams = request.nextUrl.searchParams
    const isRead = searchParams.get('isRead')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      userId: user.id,
    }

    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === 'true'
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ])

    return NextResponse.json({
      notifications,
      total,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// PUT /api/notifications/:id/read
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    if (notification.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to mark notification as read' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// PATCH /api/notifications - Mark all as read or update specific notification
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    if (body.markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })
      return NextResponse.json({ success: true })
    }

    if (body.notificationId && body.isRead !== undefined) {
      const notification = await prisma.notification.update({
        where: {
          id: body.notificationId,
          userId: user.id,
        },
        data: {
          isRead: body.isRead,
        },
      })
      return NextResponse.json({ notification })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update notifications' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

