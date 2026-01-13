import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const session = await requireAdmin()
    
    const { body } = await request.json()

    if (!body?.trim()) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      )
    }

    // Create reply
    const message = await prisma.supportMessage.create({
      data: {
        ticketId: params.ticketId,
        userId: session.user.id,
        body: body.trim(),
        isAdmin: true,
      }
    })

    // Update ticket status to IN_PROGRESS if currently OPEN
    await prisma.supportTicket.updateMany({
      where: { 
        id: params.ticketId,
        status: 'OPEN'
      },
      data: { status: 'IN_PROGRESS' }
    })

    return NextResponse.json({ message })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }
    console.error('Error replying to ticket:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

