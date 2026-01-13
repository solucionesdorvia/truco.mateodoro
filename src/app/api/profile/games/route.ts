import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await requireAuth()
    
    // Get all rooms where user participated
    const roomPlayers = await prisma.gameRoomPlayer.findMany({
      where: { userId: session.user.id },
      include: {
        room: {
          include: {
            players: {
              include: {
                user: {
                  select: { username: true }
                }
              }
            },
            creditTransactions: {
              where: { userId: session.user.id },
              select: { amount: true, type: true }
            }
          }
        }
      },
      orderBy: {
        room: { createdAt: 'desc' }
      },
      take: 50,
    })

    const games = roomPlayers.map(rp => {
      const room = rp.room
      
      // Determine result
      let result: 'WIN' | 'LOSS' | 'IN_PROGRESS' | 'CANCELLED'
      if (room.status === 'CANCELLED') {
        result = 'CANCELLED'
      } else if (room.status === 'PLAYING' || room.status === 'WAITING') {
        result = 'IN_PROGRESS'
      } else if (room.winnerTeam === rp.team) {
        result = 'WIN'
      } else {
        result = 'LOSS'
      }

      // Calculate credits change
      const creditsChange = room.creditTransactions.reduce((sum, tx) => sum + tx.amount, 0)

      return {
        id: room.id,
        mode: room.mode,
        status: room.status,
        stakeMode: room.stakeMode,
        winnerTeam: room.winnerTeam,
        myTeam: rp.team,
        createdAt: room.createdAt.toISOString(),
        finishedAt: room.finishedAt?.toISOString() || null,
        result,
        creditsChange: creditsChange !== 0 ? creditsChange : undefined,
        players: room.players.map(p => ({
          username: p.user.username,
          team: p.team,
        }))
      }
    })

    return NextResponse.json({ games })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    console.error('Error fetching games:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

