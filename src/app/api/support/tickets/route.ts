import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const body = await request.json()
    
    const { subject, category, body: description, roomId, email } = body

    if (!subject || !category || !description) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['PAGOS', 'FICHAS', 'PARTIDA', 'BUG', 'OTRO']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Categoría inválida' },
        { status: 400 }
      )
    }

    // If not logged in, require email
    if (!session?.user && !email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session?.user?.id || null,
        email: session?.user?.email || email,
        subject,
        category: category as 'PAGOS' | 'FICHAS' | 'PARTIDA' | 'BUG' | 'OTRO',
        body: description,
        roomId: roomId || null,
        status: 'OPEN',
      }
    })

    return NextResponse.json({ 
      success: true, 
      ticketId: ticket.id 
    })
  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

