import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { joinRoomSchema } from '@/lib/validations/game'
import { joinRoom } from '@/lib/services/room'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validated = joinRoomSchema.parse(body)
    
    const { room, player, alreadyJoined } = await joinRoom(
      validated.code.toUpperCase(),
      session.user.id
    )
    
    if (alreadyJoined) {
      console.log(`[API/Rooms/Join] User ${session.user.email} already in room ${room.id}`)
    } else {
      console.log(`[API/Rooms/Join] User ${session.user.email} joined room ${room.id} as ${player.team}`)
    }
    
    return NextResponse.json({
      success: true,
      roomId: room.id,
      team: player.team,
      alreadyJoined,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      )
    }
    
    console.error('[API/Rooms/Join] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al unirse a la sala' },
      { status: 500 }
    )
  }
}

