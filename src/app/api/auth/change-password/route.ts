import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { changePasswordSchema } from '@/lib/validations/auth'

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
    const validated = changePasswordSchema.parse(body)
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
    
    // Verify current password
    const passwordMatch = await bcrypt.compare(validated.currentPassword, user.passwordHash)
    
    if (!passwordMatch) {
      console.log(`[ChangePassword] Invalid current password for user ${user.email}`)
      return NextResponse.json(
        { error: 'Contraseña actual incorrecta' },
        { status: 400 }
      )
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(validated.newPassword, 12)
    
    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    })
    
    console.log(`[ChangePassword] Password changed for user ${user.email}`)
    
    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente',
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      )
    }
    
    console.error('[ChangePassword] Error:', error)
    return NextResponse.json(
      { error: 'Error al cambiar la contraseña' },
      { status: 500 }
    )
  }
}

