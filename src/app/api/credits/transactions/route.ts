import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await requireAuth()
    
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: session.user.id },
      include: {
        room: {
          select: {
            mode: true,
            codeTeamA: true,
            codeTeamB: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

