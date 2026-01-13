import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') // ONE_VS_ONE, TWO_VS_TWO, THREE_VS_THREE, or null for all
    const isPublicParam = searchParams.get('public') // 'true' to filter only public rooms
    
    const whereClause: Record<string, unknown> = {
      status: 'WAITING',
    }
    
    if (mode && mode !== 'ALL') {
      whereClause.mode = mode
    }
    
    // Filtrar solo mesas públicas en el listado
    if (isPublicParam === 'true') {
      whereClause.isPublic = true
    }
    
    const rooms = await prisma.gameRoom.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: { id: true, username: true },
        },
        players: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
          orderBy: [{ team: 'asc' }, { seatIndex: 'asc' }],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to prevent too many results
    })

    // Calculate players per team for each mode
    const getPlayersPerTeam = (mode: string) => {
      switch (mode) {
        case 'ONE_VS_ONE': return 1
        case 'TWO_VS_TWO': return 2
        case 'THREE_VS_THREE': return 3
        default: return 1
      }
    }

    // Transform rooms to include useful info
    const activeRooms = rooms.map(room => {
      const playersPerTeam = getPlayersPerTeam(room.mode)
      const totalSlots = playersPerTeam * 2
      const currentPlayers = room.players.length
      const teamA = room.players.filter(p => p.team === 'A')
      const teamB = room.players.filter(p => p.team === 'B')
      
      return {
        id: room.id,
        mode: room.mode,
        targetScore: room.targetScore,
        florEnabled: room.florEnabled,
        stakeMode: room.stakeMode,
        entryFeeCredits: room.entryFeeCredits,
        stakeTotalCredits: room.stakeTotalCredits,
        codeTeamA: room.codeTeamA,
        codeTeamB: room.codeTeamB,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
        currentPlayers,
        totalSlots,
        teamACount: teamA.length,
        teamBCount: teamB.length,
        teamASlots: playersPerTeam,
        teamBSlots: playersPerTeam,
        isFull: currentPlayers >= totalSlots,
      }
    })

    // Filter out full rooms
    const availableRooms = activeRooms.filter(room => !room.isFull)

    return NextResponse.json({
      success: true,
      rooms: availableRooms,
    })
  } catch (error) {
    console.error('[API/Rooms/Active] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener mesas activas' },
      { status: 500 }
    )
  }
}

