import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()
    
    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ],
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }
    console.error('Error fetching support tickets:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

