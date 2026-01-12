import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getRoomState, canStartGame } from '@/lib/services/room'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const { roomId } = await params
    const room = await getRoomState(roomId)
    
    // Check if user is in this room
    const isPlayer = room.players.some(p => p.userId === session.user.id)
    const isCreator = room.createdById === session.user.id
    
    if (!isPlayer && !isCreator && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes acceso a esta sala' },
        { status: 403 }
      )
    }
    
    const startCheck = await canStartGame(roomId)
    
    return NextResponse.json({
      room,
      canStart: startCheck.canStart,
      startBlockReason: startCheck.reason,
      isCreator,
      currentUserId: session.user.id,
    })
  } catch (error) {
    console.error('[API/Room] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener la sala' },
      { status: 500 }
    )
  }
}

