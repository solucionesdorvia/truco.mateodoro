import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const { status } = body

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: params.ticketId },
      data: { status: status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' }
    })

    return NextResponse.json({ ticket })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }
    console.error('Error updating ticket:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

