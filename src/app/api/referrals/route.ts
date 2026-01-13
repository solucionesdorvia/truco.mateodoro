import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { nanoid } from 'nanoid'

// Configuración de bonos
const REFERRAL_CONFIG = {
  REFERRED_SIGNUP_BONUS: 20,    // Fichas para el referido al registrarse
  REFERRER_ACTIVATION_BONUS: 50, // Fichas para el referente cuando el referido activa
  REFERRER_PURCHASE_BONUS: 100,  // Fichas extra cuando el referido compra por primera vez
  GAMES_TO_ACTIVATE: 3,          // Partidas necesarias para activar
}

// GET - Obtener datos de referidos del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        referralCode: true,
        referralRecords: {
          include: {
            referred: {
              select: {
                id: true,
                username: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Si no tiene código de referido, generar uno
    let referralCode = user.referralCode
    if (!referralCode) {
      referralCode = nanoid(8).toUpperCase()
      await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode },
      })
    }

    // Calcular stats
    const stats = {
      totalReferrals: user.referralRecords.length,
      pendingReferrals: user.referralRecords.filter(r => r.status === 'PENDING').length,
      activatedReferrals: user.referralRecords.filter(r => r.status === 'ACTIVATED' || r.status === 'PURCHASED').length,
      totalEarned: user.referralRecords.reduce((sum, r) => sum + r.referrerBonus + r.purchaseBonus, 0),
    }

    return NextResponse.json({
      success: true,
      referralCode,
      referralLink: `${process.env.NEXTAUTH_URL || ''}/register?ref=${referralCode}`,
      stats,
      referrals: user.referralRecords.map(r => ({
        id: r.id,
        username: r.referred.username,
        status: r.status,
        gamesCompleted: r.gamesCompleted,
        bonusEarned: r.referrerBonus + r.purchaseBonus,
        createdAt: r.createdAt,
        activatedAt: r.activatedAt,
      })),
      config: {
        signupBonus: REFERRAL_CONFIG.REFERRED_SIGNUP_BONUS,
        activationBonus: REFERRAL_CONFIG.REFERRER_ACTIVATION_BONUS,
        purchaseBonus: REFERRAL_CONFIG.REFERRER_PURCHASE_BONUS,
        gamesToActivate: REFERRAL_CONFIG.GAMES_TO_ACTIVATE,
      },
    })
  } catch (error) {
    console.error('[API/Referrals] GET Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener referidos' },
      { status: 500 }
    )
  }
}

// POST - Regenerar código de referido
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { action } = await request.json()

    if (action === 'regenerate') {
      const newCode = nanoid(8).toUpperCase()
      
      await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode: newCode },
      })

      return NextResponse.json({
        success: true,
        referralCode: newCode,
        referralLink: `${process.env.NEXTAUTH_URL || ''}/register?ref=${newCode}`,
      })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('[API/Referrals] POST Error:', error)
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    )
  }
}

