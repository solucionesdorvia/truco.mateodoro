import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getUserTransactions } from '@/lib/services/credits'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      )
    }
    
    const { userId } = await params
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        creditsBalance: true,
        createdAt: true,
        mustChangePassword: true,
        _count: {
          select: {
            roomPlayers: true,
            creditTransactions: true,
          },
        },
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
    
    // Get recent transactions
    const transactions = await getUserTransactions(userId, 50)
    
    return NextResponse.json({
      user,
      transactions,
    })
  } catch (error) {
    console.error('[Admin/User] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}

