import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { loadCreditsSchema } from '@/lib/validations/admin'
import { adminLoadCredits } from '@/lib/services/credits'

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
    const validated = loadCreditsSchema.parse(body)
    
    const result = await adminLoadCredits(
      session.user.id,
      validated.userId,
      validated.amount,
      validated.note
    )
    
    console.log(`[Admin] Credits loaded: admin=${session.user.email}, user=${validated.userId}, amount=${validated.amount}`)
    
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
    
    console.error('[Admin/Credits/Load] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al cargar créditos' },
      { status: 500 }
    )
  }
}

