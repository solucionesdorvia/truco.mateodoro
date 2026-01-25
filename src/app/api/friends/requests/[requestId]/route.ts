import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { requestId } = await params
    const body = await request.json()
    const action = body.action as 'accept' | 'reject' | 'cancel' | undefined

    if (!action) {
      return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
    }

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    })

    if (!friendRequest) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })
    }

    if (action === 'accept' || action === 'reject') {
      if (friendRequest.toUserId !== session.user.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }
      if (friendRequest.status !== 'PENDING') {
        return NextResponse.json({ error: 'La solicitud ya fue procesada' }, { status: 400 })
      }
      const updated = await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' },
      })
      return NextResponse.json({
        request: updated,
        message: action === 'accept' ? 'Solicitud aceptada' : 'Solicitud rechazada',
      })
    }

    if (action === 'cancel') {
      if (friendRequest.fromUserId !== session.user.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }
      if (friendRequest.status !== 'PENDING') {
        return NextResponse.json({ error: 'La solicitud ya fue procesada' }, { status: 400 })
      }
      const updated = await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'CANCELLED' },
      })
      return NextResponse.json({ request: updated, message: 'Solicitud cancelada' })
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  } catch (error) {
    console.error('[API/Friends/Requests] Error:', error)
    return NextResponse.json({ error: 'Error al actualizar solicitud' }, { status: 500 })
  }
}
