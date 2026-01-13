'use client'

import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: '/api/socket',
      autoConnect: false,
    })
  }
  return socket
}

export function connectSocket(): Socket {
  const s = getSocket()
  if (!s.connected) {
    s.connect()
  }
  return s
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Type definitions for events
export interface RoomState {
  id: string
  mode: string
  targetScore: number
  florEnabled: boolean
  chatEnabled: boolean
  timerEnabled: boolean
  timerSeconds: number
  status: 'WAITING' | 'PLAYING' | 'FINISHED' | 'CANCELLED'
  codeTeamA: string
  codeTeamB: string
  stakeMode: 'NONE' | 'ENTRY_FEE' | 'TEAM_POOL'
  stakeTotalCredits: number | null
  payoutMode: 'PROPORTIONAL' | 'SINGLE_RECEIVER'
  createdBy: {
    id: string
    username: string
  }
  players: Array<{
    id: string
    oderId?: string
    userId: string
    team: 'A' | 'B'
    seatIndex: number
    isConnected: boolean
    user: {
      id: string
      username: string
      creditsBalance: number
    }
  }>
  stakeContributions: Array<{
    id: string
    oderId?: string
    userId: string
    team: 'A' | 'B'
    amountCredits: number
    isLocked: boolean
    user: {
      id: string
      username: string
    }
  }>
  chatMessages?: Array<{
    id: string
    message: string
    user: {
      username: string
    }
    createdAt: string
  }>
}

export interface ChatMessage {
  id: string
  oderId: string
  username: string
  message: string
  timestamp: string
}

export interface GameStateView {
  roomId: string
  players: Array<{
    oderId: string
    odername: string
    team: 'A' | 'B'
    seatIndex: number
    cards: Array<{
      number: number
      suit: string
      id: string
    }>
    hasFlor: boolean
    envidoPoints: number
    isConnected: boolean
  }>
  scoreA: number
  scoreB: number
  targetScore: number
  florEnabled: boolean
  currentRound: {
    roundNumber: number
    handPlayer: string
    bazas: Array<{
      cardA: { number: number; suit: string; id: string } | null
      cardB: { number: number; suit: string; id: string } | null
      playerCardA: string | null
      playerCardB: string | null
      winner: 'A' | 'B' | 'tie' | null
    }>
    currentBazaIndex: number
    trucoState: {
      level: number
      pendingCall: string | null
      calledBy: string | null
      accepted: boolean
    }
    envidoState: {
      called: boolean
      calls: string[]
      pendingCall: string | null
      calledBy: string | null
      accepted: boolean
      resolved: boolean
      points: number
      winnerId: string | null
      winnerTeam: 'A' | 'B' | null
    }
    florState: {
      enabled: boolean
      called: boolean
      playersWithFlor: string[]
      resolved: boolean
    }
    mazoState: {
      teamWentToMazo: 'A' | 'B' | null
    }
    currentTurn: string
    canPlayCard: boolean
    waitingForResponse: string | null
  } | null
  winner: 'A' | 'B' | null
  isFinished: boolean
  lastAction: {
    type: string
    playerId: string
    data: unknown
    timestamp: number
  } | null
}

