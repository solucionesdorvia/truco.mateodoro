import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import prisma from '@/lib/prisma'
import { registerSchema } from '@/lib/validations/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validated = registerSchema.parse(body)
    
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.email },
    })
    
    if (existingEmail) {
      console.log(`[Register] Email already exists: ${validated.email}`)
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      )
    }
    
    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: validated.username },
    })
    
    if (existingUsername) {
      console.log(`[Register] Username already exists: ${validated.username}`)
      return NextResponse.json(
        { error: 'Este nombre de usuario ya está en uso' },
        { status: 400 }
      )
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 12)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        username: validated.username,
        passwordHash,
        role: 'USER',
        creditsBalance: 0,
        mustChangePassword: false,
      },
    })
    
    console.log(`[Register] User created: ${user.email} (${user.username})`)
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      )
    }
    
    console.error('[Register] Error:', error)
    return NextResponse.json(
      { error: 'Error al crear la cuenta' },
      { status: 500 }
    )
  }
}

