import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const where = status
      ? { status: status as 'WAITING' | 'PLAYING' | 'FINISHED' | 'CANCELLED' }
      : {}
    
    const [rooms, total] = await Promise.all([
      prisma.gameRoom.findMany({
        where,
        select: {
          id: true,
          mode: true,
          status: true,
          stakeMode: true,
          stakeTotalCredits: true,
          codeTeamA: true,
          codeTeamB: true,
          createdAt: true,
          startedAt: true,
          finishedAt: true,
          winnerTeam: true,
          createdBy: {
            select: {
              username: true,
            },
          },
          players: {
            select: {
              team: true,
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
          _count: {
            select: {
              players: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.gameRoom.count({ where }),
    ])
    
    return NextResponse.json({
      rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Admin/Rooms] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener salas' },
      { status: 500 }
    )
  }
}

