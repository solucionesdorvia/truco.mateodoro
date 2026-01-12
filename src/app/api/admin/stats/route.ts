import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      )
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const [
      totalUsers,
      totalCreditsIssued,
      transactionsToday,
      activeRooms,
      roomsByStatus,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total credits issued (sum of all ADMIN_LOAD transactions)
      prisma.creditTransaction.aggregate({
        where: { type: 'ADMIN_LOAD' },
        _sum: { amount: true },
      }),
      
      // Transactions today
      prisma.creditTransaction.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      
      // Active rooms (WAITING or PLAYING)
      prisma.gameRoom.count({
        where: {
          status: { in: ['WAITING', 'PLAYING'] },
        },
      }),
      
      // Rooms by status
      prisma.gameRoom.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])
    
    return NextResponse.json({
      stats: {
        totalUsers,
        totalCreditsIssued: totalCreditsIssued._sum.amount || 0,
        transactionsToday,
        activeRooms,
        roomsByStatus: roomsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status
          return acc
        }, {} as Record<string, number>),
      },
    })
  } catch (error) {
    console.error('[Admin/Stats] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}

