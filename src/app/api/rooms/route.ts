import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createRoomSchema } from '@/lib/validations/game'
import { createRoom } from '@/lib/services/room'

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
    const validated = createRoomSchema.parse(body)
    
    const room = await createRoom({
      createdById: session.user.id,
      mode: validated.mode,
      targetScore: validated.targetScore,
      florEnabled: validated.florEnabled,
      chatEnabled: validated.chatEnabled,
      timerEnabled: validated.timerEnabled,
      timerSeconds: validated.timerSeconds,
      isPublic: validated.isPublic,
      stakeMode: validated.stakeMode,
      entryFeeCredits: validated.entryFeeCredits,
      stakeTotalCredits: validated.stakeTotalCredits,
      payoutMode: validated.payoutMode,
    })
    
    console.log(`[API/Rooms] Room created: ${room.id} by ${session.user.email}`)
    
    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        codeTeamA: room.codeTeamA,
        codeTeamB: room.codeTeamB,
        mode: room.mode,
        stakeMode: room.stakeMode,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      )
    }
    
    console.error('[API/Rooms] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear la sala' },
      { status: 500 }
    )
  }
}

