import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { startGame } from '@/lib/services/room'

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
    await startGame(roomId, session.user.id)
    
    console.log(`[API/Room/Start] Game started: ${roomId} by ${session.user.email}`)
    
    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('[API/Room/Start] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al iniciar la partida' },
      { status: 500 }
    )
  }
}

