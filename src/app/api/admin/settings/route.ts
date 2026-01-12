import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { updatePlatformFeeSchema } from '@/lib/validations/admin'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      )
    }
    
    let settings = await prisma.settings.findUnique({
      where: { id: 'global' },
    })
    
    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 'global',
          platformFeePercent: 0,
        },
      })
    }
    
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[Admin/Settings] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validated = updatePlatformFeeSchema.parse(body)
    
    const settings = await prisma.settings.upsert({
      where: { id: 'global' },
      update: {
        platformFeePercent: validated.platformFeePercent,
      },
      create: {
        id: 'global',
        platformFeePercent: validated.platformFeePercent,
      },
    })
    
    console.log(`[Admin] Platform fee updated: ${validated.platformFeePercent}% by ${session.user.email}`)
    
    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      )
    }
    
    console.error('[Admin/Settings] Error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}

