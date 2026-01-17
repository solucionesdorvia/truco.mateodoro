import { Server as HttpServer } from 'http'
import { Server as SocketServer, Socket } from 'socket.io'
import prisma from '@/lib/prisma'
import {
  applyAction,
  createMatch,
  dealHand,
  deserializeMatch,
  getPlayerView,
  Match,
  serializeMatch,
} from '@/lib/truco'
import { finishGame } from '@/lib/services/room'

// Store active game states in memory (backed by DB)
const gameStates = new Map<string, Match>()

// Socket to user mapping
const socketToUser = new Map<string, { oderId: string; roomId: string }>()
const userToSocket = new Map<string, string>()

function logMatchEvent(roomId: string, match: Match) {
  const event = match.log[match.log.length - 1]
  if (!event) return
  console.log(`[Truco] room=${roomId} event=${event.type} player=${event.playerId}`)
}

export function initSocketServer(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socket',
  })

  console.log('[Socket.IO] Server initialized')

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`)

    // Join a room
    socket.on('room:join', async (data: { roomId: string; oderId: string }) => {
      try {
        const { roomId, oderId } = data
        
        // Verify user is part of this room
        const player = await prisma.gameRoomPlayer.findUnique({
          where: {
            roomId_userId: { roomId, userId: oderId },
          },
          include: {
            user: { select: { username: true } },
            room: {
              include: {
                players: {
                  include: { user: { select: { id: true, username: true, creditsBalance: true } } },
                  orderBy: [{ team: 'asc' }, { seatIndex: 'asc' }],
                },
                stakeContributions: true,
              },
            },
          },
        })

        if (!player) {
          socket.emit('error', { message: 'No tienes acceso a esta sala' })
          return
        }

        // Update connection status
        await prisma.gameRoomPlayer.update({
          where: { id: player.id },
          data: { isConnected: true, disconnectedAt: null },
        })

        // Store mapping
        socketToUser.set(socket.id, { oderId, roomId })
        userToSocket.set(`${roomId}:${oderId}`, socket.id)

        // Join socket room
        socket.join(roomId)

        console.log(`[Socket.IO] User ${player.user.username} joined room ${roomId}, status: ${player.room.status}`)

        // Send current room state
        const roomState = await getRoomState(roomId)
        socket.emit('room:state', roomState)

        // If the game is already in progress, send the game state too
        if (player.room.status === 'PLAYING') {
          const gameState = await getOrLoadGameState(roomId)
          if (gameState) {
            socket.emit('game:state', getPlayerView(gameState, oderId))
            console.log(`[Socket.IO] Sent game state to reconnecting user ${player.user.username}`)
          }
        }

        // Notify others
        socket.to(roomId).emit('player:joined', {
          oderId,
          username: player.user.username,
          team: player.team,
        })
      } catch (error) {
        console.error('[Socket.IO] room:join error:', error)
        socket.emit('error', { message: 'Error al unirse a la sala' })
      }
    })

    // Update stake contribution
    socket.on('stake:update', async (data: { roomId: string; amount: number }) => {
      try {
        const userInfo = socketToUser.get(socket.id)
        if (!userInfo) return

        const { roomId, amount } = data
        const { oderId } = userInfo

        // Import and call the service
        const { updateStakeContribution } = await import('@/lib/services/room')
        await updateStakeContribution(roomId, oderId, amount)

        // Broadcast updated room state
        const roomState = await getRoomState(roomId)
        io.to(roomId).emit('room:state', roomState)
      } catch (error) {
        console.error('[Socket.IO] stake:update error:', error)
        socket.emit('error', { message: error instanceof Error ? error.message : 'Error' })
      }
    })

    // Start game
    socket.on('game:start', async (data: { roomId: string }) => {
      try {
        const userInfo = socketToUser.get(socket.id)
        if (!userInfo) return

        const { roomId } = data
        const { oderId } = userInfo

        // Start the game using room service
        const { startGame: startRoomGame } = await import('@/lib/services/room')
        await startRoomGame(roomId, oderId)

        // Get room with players
        const room = await prisma.gameRoom.findUnique({
          where: { id: roomId },
          include: {
            players: {
              include: { user: { select: { id: true, username: true } } },
              orderBy: [{ team: 'asc' }, { seatIndex: 'asc' }],
            },
          },
        })

        if (!room) return

        // Initialize game state
        const players = room.players.map(p => ({
          playerId: p.userId,
          name: p.user.username,
          team: p.team as 'A' | 'B',
          seatIndex: p.seatIndex,
        }))

        let gameState = createMatch({
          id: roomId,
          players,
          targetScore: room.targetScore as 15 | 30,
          florEnabled: room.florEnabled,
        })

        gameState = dealHand(gameState)

        // Store state
        gameStates.set(roomId, gameState)
        logMatchEvent(roomId, gameState)

        // Save to DB
        await prisma.gameRoom.update({
          where: { id: roomId },
          data: { gameState: serializeMatch(gameState) },
        })

        console.log(`[Socket.IO] Game started in room ${roomId}`)

        // Send game state to all players
        for (const player of room.players) {
          const playerSocket = userToSocket.get(`${roomId}:${player.userId}`)
          if (playerSocket) {
            io.to(playerSocket).emit('game:state', getPlayerView(gameState, player.userId))
          }
        }

        io.to(roomId).emit('game:started', { roomId })
      } catch (error) {
        console.error('[Socket.IO] game:start error:', error)
        socket.emit('error', { message: error instanceof Error ? error.message : 'Error al iniciar' })
      }
    })

    // Play card
    socket.on('game:playCard', async (data: { roomId: string; cardId: string }) => {
      try {
        const userInfo = socketToUser.get(socket.id)
        if (!userInfo) return

        const { roomId, cardId } = data
        const { oderId } = userInfo

        let gameState = gameStates.get(roomId)
        if (!gameState) {
          // Try to load from DB
          const room = await prisma.gameRoom.findUnique({
            where: { id: roomId },
            select: { gameState: true },
          })
          if (room?.gameState) {
            gameState = deserializeMatch(room.gameState as string)
            gameStates.set(roomId, gameState)
          }
        }

        if (!gameState) {
          socket.emit('error', { message: 'Estado del juego no encontrado' })
          return
        }

        // Play the card
        gameState = applyAction(gameState, {
          type: 'PLAY_CARD',
          playerId: oderId,
          cardId,
        })
        gameStates.set(roomId, gameState)
        logMatchEvent(roomId, gameState)

        // Save to DB
        await prisma.gameRoom.update({
          where: { id: roomId },
          data: { gameState: serializeMatch(gameState) },
        })

        // Check if game is finished
        if (gameState.isFinished && gameState.winnerTeam) {
          await handleGameEnd(roomId, gameState.winnerTeam, io)
        } else if (gameState.status === 'HAND_END') {
          gameState = applyAction(gameState, { type: 'DEAL_HAND' })
          gameStates.set(roomId, gameState)
          await prisma.gameRoom.update({
            where: { id: roomId },
            data: { gameState: serializeMatch(gameState) },
          })
        }

        // Broadcast updated state
        await broadcastGameState(roomId, gameState, io)
      } catch (error) {
        console.error('[Socket.IO] game:playCard error:', error)
        socket.emit('error', { message: error instanceof Error ? error.message : 'Error al jugar carta' })
      }
    })

    // Call truco
    socket.on('game:callTruco', async (data: { roomId: string }) => {
      try {
        const userInfo = socketToUser.get(socket.id)
        if (!userInfo) return

        const { roomId } = data
        const { oderId } = userInfo

        let gameState = await getOrLoadGameState(roomId)
        if (!gameState) {
          socket.emit('error', { message: 'Estado del juego no encontrado' })
          return
        }

        gameState = applyAction(gameState, { type: 'CALL_TRUCO', playerId: oderId })
        gameStates.set(roomId, gameState)
        logMatchEvent(roomId, gameState)

        await saveGameState(roomId, gameState)
        await broadcastGameState(roomId, gameState, io)
      } catch (error) {
        console.error('[Socket.IO] game:callTruco error:', error)
        socket.emit('error', { message: error instanceof Error ? error.message : 'Error' })
      }
    })

    // Respond to truco
    socket.on('game:respondTruco', async (data: { roomId: string; response: 'accept' | 'reject' }) => {
      try {
        const userInfo = socketToUser.get(socket.id)
        if (!userInfo) return

        const { roomId, response } = data
        const { oderId } = userInfo

        let gameState = await getOrLoadGameState(roomId)
        if (!gameState) return

        const responseMapped = response === 'accept' ? 'QUIERO' : 'NO_QUIERO'
        gameState = applyAction(gameState, {
          type: 'RESPOND_CALL',
          playerId: oderId,
          response: responseMapped,
        })
        gameStates.set(roomId, gameState)
        logMatchEvent(roomId, gameState)

        await saveGameState(roomId, gameState)

        if (gameState.isFinished && gameState.winnerTeam) {
          await handleGameEnd(roomId, gameState.winnerTeam, io)
        } else if (gameState.status === 'HAND_END') {
          gameState = applyAction(gameState, { type: 'DEAL_HAND' })
          gameStates.set(roomId, gameState)
          await saveGameState(roomId, gameState)
        }

        await broadcastGameState(roomId, gameState, io)
      } catch (error) {
        console.error('[Socket.IO] game:respondTruco error:', error)
        socket.emit('error', { message: error instanceof Error ? error.message : 'Error' })
      }
    })

    // Call envido
    socket.on('game:callEnvido', async (data: { roomId: string; call: string }) => {
      try {
        const userInfo = socketToUser.get(socket.id)
        if (!userInfo) return

        const { roomId, call } = data
        const { oderId } = userInfo

        let gameState = await getOrLoadGameState(roomId)
        if (!gameState) return

        const normalizedCall = call.toUpperCase()
        gameState = applyAction(gameState, {
          type: 'CALL_ENVIDO',
          playerId: oderId,
          call: normalizedCall as 'ENVIDO' | 'REAL_ENVIDO' | 'FALTA_ENVIDO' | 'ENVIDO_ENVIDO',
        })
        gameStates.set(roomId, gameState)
        logMatchEvent(roomId, gameState)

        await saveGameState(roomId, gameState)
        await broadcastGameState(roomId, gameState, io)
      } catch (error) {
        console.error('[Socket.IO] game:callEnvido error:', error)
        socket.emit('error', { message: error instanceof Error ? error.message : 'Error' })
      }
    })

    // Respond to envido
    socket.on('game:respondEnvido', async (data: { roomId: string; response: 'accept' | 'reject' }) => {
      try {
        const userInfo = socketToUser.get(socket.id)
        if (!userInfo) return

        const { roomId, response } = data
        const { oderId } = userInfo

        let gameState = await getOrLoadGameState(roomId)
        if (!gameState) return

        const responseMapped = response === 'accept' ? 'QUIERO' : 'NO_QUIERO'
        gameState = applyAction(gameState, {
          type: 'RESPOND_CALL',
          playerId: oderId,
          response: responseMapped,
        })
        gameStates.set(roomId, gameState)
        logMatchEvent(roomId, gameState)

        await saveGameState(roomId, gameState)
        await broadcastGameState(roomId, gameState, io)
      } catch (error) {
        console.error('[Socket.IO] game:respondEnvido error:', error)
        socket.emit('error', { message: error instanceof Error ? error.message : 'Error' })
      }
    })

    // Respond to flor
    socket.on('game:respondFlor', async (data: { roomId: string; response: 'accept' | 'reject' }) => {
      try {
        const userInfo = socketToUser.get(socket.id)
        if (!userInfo) return

        const { roomId, response } = data
        const { oderId } = userInfo

        let gameState = await getOrLoadGameState(roomId)
        if (!gameState) return

        const responseMapped = response === 'accept' ? 'QUIERO' : 'NO_QUIERO'
        gameState = applyAction(gameState, {
          type: 'RESPOND_CALL',
          playerId: oderId,
          response: responseMapped,
        })
        gameStates.set(roomId, gameState)
        logMatchEvent(roomId, gameState)

        await saveGameState(roomId, gameState)
        await broadcastGameState(roomId, gameState, io)
      } catch (error) {
        console.error('[Socket.IO] game:respondFlor error:', error)
        socket.emit('error', { message: error instanceof Error ? error.message : 'Error' })
      }
    })

    // Call flor
    socket.on('game:callFlor', async (data: { roomId: string }) => {
      try {
        const userInfo = socketToUser.get(socket.id)
        if (!userInfo) return

        const { roomId } = data
        const { oderId } = userInfo

        let gameState = await getOrLoadGameState(roomId)
        if (!gameState) return

        gameState = applyAction(gameState, { type: 'CALL_FLOR', playerId: oderId })
        gameStates.set(roomId, gameState)
        logMatchEvent(roomId, gameState)

        await saveGameState(roomId, gameState)
        await broadcastGameState(roomId, gameState, io)
      } catch (error) {
        console.error('[Socket.IO] game:callFlor error:', error)
        socket.emit('error', { message: error instanceof Error ? error.message : 'Error' })
      }
    })

    // Go to mazo (fold)
    socket.on('game:fold', async (data: { roomId: string }) => {
      try {
        const userInfo = socketToUser.get(socket.id)
        if (!userInfo) return

        const { roomId } = data
        const { oderId } = userInfo

        let gameState = await getOrLoadGameState(roomId)
        if (!gameState) return

        gameState = applyAction(gameState, { type: 'FOLD_TO_MAZO', playerId: oderId })
        gameStates.set(roomId, gameState)

        await saveGameState(roomId, gameState)

        if (gameState.isFinished && gameState.winnerTeam) {
          await handleGameEnd(roomId, gameState.winnerTeam, io)
        } else if (gameState.status === 'HAND_END') {
          gameState = applyAction(gameState, { type: 'DEAL_HAND' })
          gameStates.set(roomId, gameState)
          await saveGameState(roomId, gameState)
        }

        await broadcastGameState(roomId, gameState, io)
      } catch (error) {
        console.error('[Socket.IO] game:fold error:', error)
        socket.emit('error', { message: error instanceof Error ? error.message : 'Error' })
      }
    })

    // Chat message
    socket.on('chat:send', async (data: { roomId: string; message: string }) => {
      try {
        const userInfo = socketToUser.get(socket.id)
        if (!userInfo) return

        const { roomId, message } = data
        const { oderId } = userInfo

        // Get room to check if chat is enabled
        const room = await prisma.gameRoom.findUnique({
          where: { id: roomId },
          select: { chatEnabled: true },
        })

        if (!room?.chatEnabled) {
          socket.emit('error', { message: 'El chat está deshabilitado' })
          return
        }

        // Get user
        const user = await prisma.user.findUnique({
          where: { id: oderId },
          select: { username: true },
        })

        // Save message
        const chatMessage = await prisma.chatMessage.create({
          data: {
            roomId,
            userId: oderId,
            message: message.slice(0, 500), // Limit length
          },
        })

        // Broadcast to room
        io.to(roomId).emit('chat:message', {
          id: chatMessage.id,
          oderId,
          username: user?.username || 'Unknown',
          message: chatMessage.message,
          timestamp: chatMessage.createdAt.toISOString(),
        })
      } catch (error) {
        console.error('[Socket.IO] chat:send error:', error)
      }
    })

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        const userInfo = socketToUser.get(socket.id)
        if (userInfo) {
          const { oderId, roomId } = userInfo

          // Update connection status
          await prisma.gameRoomPlayer.updateMany({
            where: { roomId, userId: oderId },
            data: { isConnected: false, disconnectedAt: new Date() },
          })

          // Notify room
          socket.to(roomId).emit('player:disconnected', { oderId })

          // Clean up mappings
          socketToUser.delete(socket.id)
          userToSocket.delete(`${roomId}:${oderId}`)

          console.log(`[Socket.IO] User ${oderId} disconnected from room ${roomId}`)
        }
      } catch (error) {
        console.error('[Socket.IO] disconnect error:', error)
      }
    })
  })

  return io
}

async function getRoomState(roomId: string) {
  const room = await prisma.gameRoom.findUnique({
    where: { id: roomId },
    include: {
      createdBy: { select: { id: true, username: true } },
      players: {
        include: { user: { select: { id: true, username: true, creditsBalance: true } } },
        orderBy: [{ team: 'asc' }, { seatIndex: 'asc' }],
      },
      stakeContributions: {
        include: { user: { select: { id: true, username: true } } },
      },
      chatMessages: {
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  })

  return room
}

async function getOrLoadGameState(roomId: string): Promise<Match | null> {
  let gameState = gameStates.get(roomId)
  if (!gameState) {
    const room = await prisma.gameRoom.findUnique({
      where: { id: roomId },
      select: { gameState: true },
    })
    if (room?.gameState) {
      gameState = deserializeMatch(room.gameState as string)
      gameStates.set(roomId, gameState)
    }
  }
  return gameState || null
}

async function saveGameState(roomId: string, gameState: Match) {
  await prisma.gameRoom.update({
    where: { id: roomId },
    data: { gameState: serializeMatch(gameState) },
  })
}

async function broadcastGameState(roomId: string, gameState: Match, io: SocketServer) {
  const room = await prisma.gameRoom.findUnique({
    where: { id: roomId },
    include: { players: true },
  })

  if (!room) return

  const lastEvent = gameState.log[gameState.log.length - 1]
  if (lastEvent) {
    const callMadeTypes = ['CALL_TRUCO', 'CALL_ENVIDO', 'CALL_FLOR']
    const callResolvedTypes = [
      'TRUCO_ACCEPTED',
      'TRUCO_REJECTED',
      'ENVIDO_ACCEPTED',
      'ENVIDO_REJECTED',
      'FLOR_ACCEPTED',
      'FLOR_REJECTED',
    ]
    if (callMadeTypes.includes(lastEvent.type)) {
      io.to(roomId).emit('CALL_MADE', { event: lastEvent })
    }
    if (callResolvedTypes.includes(lastEvent.type)) {
      io.to(roomId).emit('CALL_RESOLVED', { event: lastEvent })
    }
    if (lastEvent.type === 'HAND_DEALT') {
      io.to(roomId).emit('HAND_DEALT', { event: lastEvent })
    }
  }

  io.to(roomId).emit('MATCH_UPDATED', { matchId: roomId, status: gameState.status })

  for (const player of room.players) {
    const playerSocket = userToSocket.get(`${roomId}:${player.userId}`)
    if (playerSocket) {
      io.to(playerSocket).emit('game:state', getPlayerView(gameState, player.userId))
    }
  }
}

async function handleGameEnd(roomId: string, winner: 'A' | 'B', io: SocketServer) {
  try {
    await finishGame(roomId, winner)
    io.to(roomId).emit('game:finished', { winner })
    gameStates.delete(roomId)
    console.log(`[Socket.IO] Game ${roomId} finished. Winner: ${winner}`)
  } catch (error) {
    console.error('[Socket.IO] handleGameEnd error:', error)
  }
}

