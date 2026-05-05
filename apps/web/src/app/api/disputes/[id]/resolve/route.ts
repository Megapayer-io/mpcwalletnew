import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/disputes/:id/resolve
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request)
    const body = await request.json()

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        trade: true,
      },
    })

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    if (dispute.status !== 'open') {
      return NextResponse.json({ error: 'Dispute already resolved' }, { status: 400 })
    }

    const resolution = body.resolution // 'buyer' or 'seller'

    // Update dispute
    const updatedDispute = await prisma.dispute.update({
      where: { id: params.id },
      data: {
        status: 'resolved',
        resolvedAt: new Date(),
        adminId: user.id,
        resolution,
      },
    })

    // Update trade status
    await prisma.trade.update({
      where: { id: dispute.tradeId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    })

    // Create resolution message
    await prisma.disputeMessage.create({
      data: {
        disputeId: params.id,
        senderId: user.id,
        message: `Dispute resolved in favor of ${resolution}. Trade marked as completed.`,
      },
    })

    return NextResponse.json({ dispute: updatedDispute })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to resolve dispute' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

