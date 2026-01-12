import prisma from '@/lib/prisma'
import { CreditTransactionType } from '@prisma/client'

interface CreateTransactionParams {
  userId: string
  amount: number
  type: CreditTransactionType
  roomId?: string
  note?: string
}

/**
 * Creates a credit transaction and updates user balance atomically
 */
export async function createCreditTransaction(params: CreateTransactionParams) {
  const { userId, amount, type, roomId, note } = params
  
  console.log(`[Credits] Creating transaction: user=${userId}, amount=${amount}, type=${type}`)
  
  // Use transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Create transaction record
    const transaction = await tx.creditTransaction.create({
      data: {
        userId,
        amount,
        type,
        roomId,
        note,
      },
    })
    
    // Update user balance
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        creditsBalance: {
          increment: amount,
        },
      },
    })
    
    console.log(`[Credits] Transaction created: id=${transaction.id}, newBalance=${user.creditsBalance}`)
    
    return {
      transaction,
      newBalance: user.creditsBalance,
    }
  })
  
  return result
}

/**
 * Admin: Load credits to a user
 */
export async function adminLoadCredits(
  adminId: string,
  userId: string,
  amount: number,
  note?: string
) {
  if (amount <= 0) {
    throw new Error('El monto debe ser positivo')
  }
  
  console.log(`[Credits] Admin ${adminId} loading ${amount} credits to user ${userId}`)
  
  return createCreditTransaction({
    userId,
    amount,
    type: 'ADMIN_LOAD',
    note: note || `Carga de créditos por admin`,
  })
}

/**
 * Admin: Adjust credits (can be positive or negative)
 */
export async function adminAdjustCredits(
  adminId: string,
  userId: string,
  amount: number,
  note: string
) {
  if (amount === 0) {
    throw new Error('El ajuste no puede ser 0')
  }
  
  // Check if negative adjustment would result in negative balance
  if (amount < 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { creditsBalance: true },
    })
    
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    
    if (user.creditsBalance + amount < 0) {
      throw new Error('El ajuste resultaría en un saldo negativo')
    }
  }
  
  console.log(`[Credits] Admin ${adminId} adjusting ${amount} credits for user ${userId}: ${note}`)
  
  return createCreditTransaction({
    userId,
    amount,
    type: 'ADMIN_ADJUST',
    note,
  })
}

/**
 * Lock stake for a game (called when game starts)
 */
export async function lockStake(
  userId: string,
  amount: number,
  roomId: string
) {
  if (amount <= 0) {
    throw new Error('El monto de stake debe ser positivo')
  }
  
  // Check user has enough balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditsBalance: true },
  })
  
  if (!user) {
    throw new Error('Usuario no encontrado')
  }
  
  if (user.creditsBalance < amount) {
    throw new Error('Saldo insuficiente para el stake')
  }
  
  console.log(`[Credits] Locking stake: user=${userId}, amount=${amount}, room=${roomId}`)
  
  return createCreditTransaction({
    userId,
    amount: -amount, // Negative because we're deducting
    type: 'STAKE_LOCK',
    roomId,
    note: 'Stake bloqueado para partida',
  })
}

/**
 * Refund stake (called when game is cancelled)
 */
export async function refundStake(
  userId: string,
  amount: number,
  roomId: string
) {
  if (amount <= 0) {
    throw new Error('El monto de reembolso debe ser positivo')
  }
  
  console.log(`[Credits] Refunding stake: user=${userId}, amount=${amount}, room=${roomId}`)
  
  return createCreditTransaction({
    userId,
    amount, // Positive because we're returning
    type: 'STAKE_REFUND',
    roomId,
    note: 'Reembolso por cancelación de partida',
  })
}

/**
 * Pay out winnings to a user
 */
export async function payoutWinnings(
  userId: string,
  amount: number,
  roomId: string,
  note: string
) {
  if (amount <= 0) {
    throw new Error('El monto de pago debe ser positivo')
  }
  
  console.log(`[Credits] Payout: user=${userId}, amount=${amount}, room=${roomId}`)
  
  return createCreditTransaction({
    userId,
    amount,
    type: 'STAKE_PAYOUT',
    roomId,
    note,
  })
}

/**
 * Get user's transaction history
 */
export async function getUserTransactions(userId: string, limit = 50) {
  return prisma.creditTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      room: {
        select: {
          id: true,
          mode: true,
          status: true,
        },
      },
    },
  })
}

/**
 * Get user's current balance (fresh from DB)
 */
export async function getUserBalance(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditsBalance: true },
  })
  
  return user?.creditsBalance ?? 0
}

