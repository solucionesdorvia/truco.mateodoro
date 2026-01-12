import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adjustCreditsSchema } from '@/lib/validations/admin'
import { adminAdjustCredits } from '@/lib/services/credits'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validated = adjustCreditsSchema.parse(body)
    
    const result = await adminAdjustCredits(
      session.user.id,
      validated.userId,
      validated.amount,
      validated.note
    )
    
    console.log(`[Admin] Credits adjusted: admin=${session.user.email}, user=${validated.userId}, amount=${validated.amount}, note=${validated.note}`)
    
    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      newBalance: result.newBalance,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      )
    }
    
    console.error('[Admin/Credits/Adjust] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al ajustar créditos' },
      { status: 500 }
    )
  }
}

