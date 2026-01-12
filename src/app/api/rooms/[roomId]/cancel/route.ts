import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { cancelRoom } from '@/lib/services/room'

export async function POST(
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
    await cancelRoom(roomId, session.user.id)
    
    console.log(`[API/Room/Cancel] Game cancelled: ${roomId} by ${session.user.email}`)
    
    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('[API/Room/Cancel] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al cancelar la partida' },
      { status: 500 }
    )
  }
}

