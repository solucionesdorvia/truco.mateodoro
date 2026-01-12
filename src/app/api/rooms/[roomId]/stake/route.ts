import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stakeContributionSchema } from '@/lib/validations/game'
import { updateStakeContribution, setPayoutReceiver } from '@/lib/services/room'

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
    const body = await request.json()
    
    // Validate input
    const validated = stakeContributionSchema.parse({
      roomId,
      amount: body.amount,
    })
    
    const contribution = await updateStakeContribution(
      roomId,
      session.user.id,
      validated.amount
    )
    
    console.log(`[API/Room/Stake] Stake updated: room=${roomId}, user=${session.user.email}, amount=${validated.amount}`)
    
    return NextResponse.json({
      success: true,
      contribution,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      )
    }
    
    console.error('[API/Room/Stake] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar el aporte' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const body = await request.json()
    
    // Set payout receiver
    if (body.payoutReceiverUserId) {
      await setPayoutReceiver(roomId, body.payoutReceiverUserId, session.user.id)
      
      console.log(`[API/Room/Stake] Payout receiver set: room=${roomId}, receiver=${body.payoutReceiverUserId}`)
      
      return NextResponse.json({
        success: true,
      })
    }
    
    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[API/Room/Stake] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    )
  }
}

