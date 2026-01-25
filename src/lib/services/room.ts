import prisma from '@/lib/prisma'
import { GameMode, StakeMode, PayoutMode, Team } from '@prisma/client'
import { lockStake, refundStake, payoutWinnings } from './credits'

interface CreateRoomParams {
  createdById: string
  mode: GameMode
  targetScore: number
  florEnabled: boolean
  chatEnabled: boolean
  timerEnabled: boolean
  timerSeconds: number
  isPublic?: boolean
  stakeMode: StakeMode
  entryFeeCredits?: number
  stakeTotalCredits?: number
  payoutMode: PayoutMode
}

function generateRoomCode(): string {
  // Generate 8 character alphanumeric code (uppercase)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing chars: I, O, 0, 1
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function getPlayersPerTeam(mode: GameMode): number {
  switch (mode) {
    case 'ONE_VS_ONE':
      return 1
    case 'TWO_VS_TWO':
      return 2
    case 'THREE_VS_THREE':
      return 3
    default:
      return 1
  }
}

export async function createRoom(params: CreateRoomParams) {
  const {
    createdById,
    mode,
    targetScore,
    florEnabled,
    chatEnabled,
    timerEnabled,
    timerSeconds,
    isPublic = true,
    stakeMode,
    entryFeeCredits,
    stakeTotalCredits,
    payoutMode,
  } = params

  // Get platform fee
  const settings = await prisma.settings.findUnique({
    where: { id: 'global' },
  })
  const platformFeePercent = settings?.platformFeePercent ?? 0

  // Generate unique codes
  let codeTeamA = generateRoomCode()
  let codeTeamB = generateRoomCode()

  // Ensure codes are unique
  let attempts = 0
  while (attempts < 10) {
    const existing = await prisma.gameRoom.findFirst({
      where: {
        OR: [
          { codeTeamA },
          { codeTeamB },
          { codeTeamA: codeTeamB },
          { codeTeamB: codeTeamA },
        ],
      },
    })
    if (!existing && codeTeamA !== codeTeamB) break
    codeTeamA = generateRoomCode()
    codeTeamB = generateRoomCode()
    attempts++
  }

  console.log(`[Room] Creating room: mode=${mode}, stake=${stakeMode}, codes=${codeTeamA}/${codeTeamB}`)

  const room = await prisma.gameRoom.create({
    data: {
      mode,
      targetScore,
      florEnabled,
      chatEnabled,
      timerEnabled,
      timerSeconds,
      isPublic,
      status: 'WAITING',
      codeTeamA,
      codeTeamB,
      createdById,
      stakeMode,
      entryFeeCredits: stakeMode === 'ENTRY_FEE' ? entryFeeCredits : null,
      stakeTotalCredits: stakeMode === 'TEAM_POOL' ? stakeTotalCredits : null,
      payoutMode,
      platformFeePercent,
      // Add creator as first player in Team A
      players: {
        create: {
          userId: createdById,
          team: 'A',
          seatIndex: 0,
        },
      },
    },
    include: {
      createdBy: {
        select: { id: true, username: true },
      },
      players: {
        include: {
          user: {
            select: { id: true, username: true },
          },
        },
      },
    },
  })

  // If TEAM_POOL mode, create initial stake contribution for creator
  if (stakeMode === 'TEAM_POOL') {
    await prisma.stakeContribution.create({
      data: {
        roomId: room.id,
        userId: createdById,
        team: 'A',
        amountCredits: 0,
      },
    })
  }

  console.log(`[Room] Creator ${createdById} added to room ${room.id} as Team A, seat 0`)

  return room
}

export async function joinRoom(code: string, userId: string) {
  // Find room by code
  const room = await prisma.gameRoom.findFirst({
    where: {
      OR: [
        { codeTeamA: code },
        { codeTeamB: code },
      ],
    },
    include: {
      players: {
        include: {
          user: {
            select: { id: true, username: true, creditsBalance: true },
          },
        },
      },
      stakeContributions: true,
    },
  })

  if (!room) {
    throw new Error('Sala no encontrada')
  }

  if (room.status !== 'WAITING') {
    throw new Error('La partida ya comenzó o terminó')
  }

  // Determine team based on code
  const team: Team = code === room.codeTeamA ? 'A' : 'B'
  const playersPerTeam = getPlayersPerTeam(room.mode)

  // Check if user already in room
  const existingPlayer = room.players.find(p => p.userId === userId)
  if (existingPlayer) {
    // User is already in the room, return existing state
    return { room, player: existingPlayer, alreadyJoined: true }
  }

  // Check team capacity
  const teamPlayers = room.players.filter(p => p.team === team)
  if (teamPlayers.length >= playersPerTeam) {
    throw new Error('El equipo está completo')
  }

  // Find next seat index
  const usedSeats = teamPlayers.map(p => p.seatIndex)
  let seatIndex = 0
  while (usedSeats.includes(seatIndex)) {
    seatIndex++
  }

  // Create player entry
  const player = await prisma.gameRoomPlayer.create({
    data: {
      roomId: room.id,
      userId,
      team,
      seatIndex,
    },
    include: {
      user: {
        select: { id: true, username: true, creditsBalance: true },
      },
    },
  })

  // For TEAM_POOL mode, create initial stake contribution entry
  if (room.stakeMode === 'TEAM_POOL') {
    await prisma.stakeContribution.create({
      data: {
        roomId: room.id,
        userId,
        team,
        amountCredits: 0,
      },
    })
  }

  console.log(`[Room] Player ${userId} joined room ${room.id} as team ${team}, seat ${seatIndex}`)

  return { room, player, alreadyJoined: false }
}

export async function getRoomState(roomId: string) {
  const room = await prisma.gameRoom.findUnique({
    where: { id: roomId },
    include: {
      createdBy: {
        select: { id: true, username: true },
      },
      players: {
        include: {
          user: {
            select: { id: true, username: true, creditsBalance: true },
          },
        },
        orderBy: [{ team: 'asc' }, { seatIndex: 'asc' }],
      },
      stakeContributions: {
        include: {
          user: {
            select: { id: true, username: true },
          },
        },
      },
    },
  })

  if (!room) {
    throw new Error('Sala no encontrada')
  }

  return room
}

export async function getRoomByCode(code: string) {
  return prisma.gameRoom.findFirst({
    where: {
      OR: [
        { codeTeamA: code },
        { codeTeamB: code },
      ],
    },
    select: {
      id: true,
      status: true,
    },
  })
}

export async function updateStakeContribution(
  roomId: string,
  userId: string,
  amount: number
) {
  // Get room and user
  const [room, user] = await Promise.all([
    prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: {
        stakeContributions: true,
        players: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { creditsBalance: true },
    }),
  ])

  if (!room) {
    throw new Error('Sala no encontrada')
  }

  if (room.status !== 'WAITING') {
    throw new Error('No se pueden modificar aportes después de iniciar la partida')
  }

  if (room.stakeMode !== 'TEAM_POOL') {
    throw new Error('Esta sala no usa el modo de pozo por equipo')
  }

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  // Check player is in room
  const player = room.players.find(p => p.userId === userId)
  if (!player) {
    throw new Error('No estás en esta sala')
  }

  // Validate amount
  if (amount < 0) {
    throw new Error('El aporte no puede ser negativo')
  }

  if (amount > user.creditsBalance) {
    throw new Error('Saldo insuficiente')
  }

  // Update contribution
  const contribution = await prisma.stakeContribution.upsert({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
    update: {
      amountCredits: amount,
    },
    create: {
      roomId,
      userId,
      team: player.team,
      amountCredits: amount,
    },
  })

  console.log(`[Room] Stake contribution updated: room=${roomId}, user=${userId}, amount=${amount}`)

  return contribution
}

export async function setPayoutReceiver(
  roomId: string,
  payoutReceiverUserId: string,
  requesterId: string
) {
  const room = await prisma.gameRoom.findUnique({
    where: { id: roomId },
    include: { players: true },
  })

  if (!room) {
    throw new Error('Sala no encontrada')
  }

  if (room.status !== 'WAITING') {
    throw new Error('No se puede cambiar el receptor después de iniciar')
  }

  // Check requester is room creator
  if (room.createdById !== requesterId) {
    throw new Error('Solo el creador puede cambiar el receptor')
  }

  // Check receiver is a player in the room
  const receiver = room.players.find(p => p.userId === payoutReceiverUserId)
  if (!receiver) {
    throw new Error('El receptor debe ser un jugador en la sala')
  }

  await prisma.gameRoom.update({
    where: { id: roomId },
    data: {
      payoutReceiverUserId,
    },
  })

  console.log(`[Room] Payout receiver set: room=${roomId}, receiver=${payoutReceiverUserId}`)
}

export async function canStartGame(roomId: string): Promise<{ canStart: boolean; reason?: string }> {
  const room = await getRoomState(roomId)
  const playersPerTeam = getPlayersPerTeam(room.mode)

  // Check teams are full
  const teamA = room.players.filter(p => p.team === 'A')
  const teamB = room.players.filter(p => p.team === 'B')

  if (teamA.length < playersPerTeam || teamB.length < playersPerTeam) {
    return {
      canStart: false,
      reason: `Se necesitan ${playersPerTeam} jugadores por equipo`,
    }
  }

  // Check stake if TEAM_POOL mode
  if (room.stakeMode === 'TEAM_POOL' && room.stakeTotalCredits) {
    const teamAStake = room.stakeContributions
      .filter(s => s.team === 'A')
      .reduce((sum, s) => sum + s.amountCredits, 0)
    const teamBStake = room.stakeContributions
      .filter(s => s.team === 'B')
      .reduce((sum, s) => sum + s.amountCredits, 0)

    if (teamAStake < room.stakeTotalCredits || teamBStake < room.stakeTotalCredits) {
      return {
        canStart: false,
        reason: `Cada equipo debe aportar ${room.stakeTotalCredits} créditos`,
      }
    }
  }

  // Check SINGLE_RECEIVER payout mode has a receiver set
  if (room.payoutMode === 'SINGLE_RECEIVER' && !room.payoutReceiverUserId) {
    return {
      canStart: false,
      reason: 'Se debe seleccionar un receptor de pago',
    }
  }

  return { canStart: true }
}

export async function startGame(roomId: string, requesterId: string) {
  const room = await getRoomState(roomId)

  // Check requester is creator
  if (room.createdById !== requesterId) {
    throw new Error('Solo el creador puede iniciar la partida')
  }

  // Validate can start
  const { canStart, reason } = await canStartGame(roomId)
  if (!canStart) {
    throw new Error(reason || 'No se puede iniciar la partida')
  }

  // Lock stakes if TEAM_POOL mode
  if (room.stakeMode === 'TEAM_POOL') {
    for (const contribution of room.stakeContributions) {
      if (contribution.amountCredits > 0) {
        await lockStake(
          contribution.userId,
          contribution.amountCredits,
          roomId
        )
        
        // Mark contribution as locked
        await prisma.stakeContribution.update({
          where: { id: contribution.id },
          data: { isLocked: true },
        })
      }
    }
  }

  // Handle ENTRY_FEE mode
  if (room.stakeMode === 'ENTRY_FEE' && room.entryFeeCredits) {
    for (const player of room.players) {
      await lockStake(
        player.userId,
        room.entryFeeCredits,
        roomId
      )
    }
  }

  // Update room status
  await prisma.gameRoom.update({
    where: { id: roomId },
    data: {
      status: 'PLAYING',
      startedAt: new Date(),
    },
  })

  console.log(`[Room] Game started: ${roomId}`)

  return { success: true }
}

export async function cancelRoom(roomId: string, requesterId: string) {
  const room = await getRoomState(roomId)

  // Check requester is creator or admin
  if (room.createdById !== requesterId) {
    throw new Error('Solo el creador puede cancelar la partida')
  }

  if (room.status === 'FINISHED' || room.status === 'CANCELLED') {
    throw new Error('La partida ya terminó')
  }

  // Refund stakes if they were locked
  if (room.status === 'PLAYING') {
    if (room.stakeMode === 'TEAM_POOL') {
      for (const contribution of room.stakeContributions) {
        if (contribution.isLocked && contribution.amountCredits > 0) {
          await refundStake(
            contribution.userId,
            contribution.amountCredits,
            roomId
          )
        }
      }
    }

    if (room.stakeMode === 'ENTRY_FEE' && room.entryFeeCredits) {
      for (const player of room.players) {
        await refundStake(
          player.userId,
          room.entryFeeCredits,
          roomId
        )
      }
    }
  }

  // Update room status
  await prisma.gameRoom.update({
    where: { id: roomId },
    data: {
      status: 'CANCELLED',
      finishedAt: new Date(),
    },
  })

  console.log(`[Room] Game cancelled: ${roomId}`)

  return { success: true }
}

export async function finishGame(roomId: string, winnerTeam: Team) {
  const room = await getRoomState(roomId)

  if (room.status !== 'PLAYING') {
    throw new Error('La partida no está en curso')
  }

  // Calculate and distribute payouts
  if (room.stakeMode === 'TEAM_POOL' && room.stakeTotalCredits) {
    const totalPool = room.stakeTotalCredits * 2 // Both teams' stakes
    const fee = Math.floor((totalPool * room.platformFeePercent) / 100)
    const prize = totalPool - fee

    console.log(`[Room] Distributing payout: room=${roomId}, winner=${winnerTeam}, pool=${totalPool}, fee=${fee}, prize=${prize}`)

    if (room.payoutMode === 'SINGLE_RECEIVER' && room.payoutReceiverUserId) {
      // Pay everything to single receiver
      await payoutWinnings(
        room.payoutReceiverUserId,
        prize,
        roomId,
        `Premio total (receptor único) - Equipo ${winnerTeam} ganador`
      )
    } else {
      // PROPORTIONAL mode
      const winnerContributions = room.stakeContributions.filter(
        s => s.team === winnerTeam && s.amountCredits > 0
      )
      const totalWinnerStake = winnerContributions.reduce(
        (sum, s) => sum + s.amountCredits,
        0
      )

      for (const contribution of winnerContributions) {
        const proportion = contribution.amountCredits / totalWinnerStake
        const payout = Math.floor(prize * proportion)

        if (payout > 0) {
          await payoutWinnings(
            contribution.userId,
            payout,
            roomId,
            `Premio proporcional (${Math.round(proportion * 100)}%) - Equipo ${winnerTeam} ganador`
          )
        }
      }
    }
  } else if (room.stakeMode === 'ENTRY_FEE' && room.entryFeeCredits) {
    const totalPool = room.entryFeeCredits * room.players.length
    const fee = Math.floor((totalPool * room.platformFeePercent) / 100)
    const prize = totalPool - fee

    // Distribute equally among winners
    const winners = room.players.filter(p => p.team === winnerTeam)
    const payoutPerPlayer = Math.floor(prize / winners.length)

    for (const winner of winners) {
      if (payoutPerPlayer > 0) {
        await payoutWinnings(
          winner.userId,
          payoutPerPlayer,
          roomId,
          `Premio por victoria - Equipo ${winnerTeam}`
        )
      }
    }
  }

  // Update room status
  await prisma.gameRoom.update({
    where: { id: roomId },
    data: {
      status: 'FINISHED',
      finishedAt: new Date(),
      winnerTeam,
    },
  })

  console.log(`[Room] Game finished: ${roomId}, winner: ${winnerTeam}`)

  return { success: true, winnerTeam }
}

export async function leaveRoom(roomId: string, userId: string) {
  const room = await prisma.gameRoom.findUnique({
    where: { id: roomId },
    include: { players: true, stakeContributions: true },
  })

  if (!room) {
    throw new Error('Sala no encontrada')
  }

  if (room.status !== 'WAITING') {
    throw new Error('No puedes salir de una partida en curso')
  }

  // Remove player
  await prisma.gameRoomPlayer.deleteMany({
    where: { roomId, userId },
  })

  // Remove stake contribution if exists
  await prisma.stakeContribution.deleteMany({
    where: { roomId, userId },
  })

  console.log(`[Room] Player ${userId} left room ${roomId}`)

  return { success: true }
}

