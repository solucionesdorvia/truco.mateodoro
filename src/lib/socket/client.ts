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
  id: string
  status: 'WAITING_PLAYERS' | 'READY' | 'DEALING' | 'PLAYING' | 'HAND_END' | 'MATCH_END'
  players: Array<{
    playerId: string
    name: string
    team: 'A' | 'B'
    seatIndex: number
    handCards: Array<{
      number: number
      suit: string
      id: string
    }>
    hasFlor: boolean
    envidoValue: number
    isConnected: boolean
  }>
  manoIndex: number
  hand: {
    state: 'TRICK_1' | 'TRICK_2' | 'TRICK_3'
    manoPlayerId: string
    currentTrickIndex: number
    tricks: Array<{
      index: number
      plays: Array<{
        playerId: string
        card: { number: number; suit: string; id: string }
      }>
      winnerTeam: 'A' | 'B' | 'tie' | null
    }>
    turnPlayerId: string
    canPlayCard: boolean
  } | null
  score: {
    teamA: number
    teamB: number
    target: number
    handValue: number
  }
  settings: {
    targetScore: number
    florEnabled: boolean
    florBlocksEnvido: boolean
  }
  truco: {
    level: number
    accepted: boolean
    lastCalledBy: string | null
  }
  envido: {
    called: boolean
    calls: string[]
    resolved: boolean
    points: number
    winnerTeam: 'A' | 'B' | null
  }
  flor: {
    enabled: boolean
    called: boolean
    resolved: boolean
    points: number
    winnerTeam: 'A' | 'B' | null
  }
  pendingCall: {
    type: 'TRUCO' | 'ENVIDO' | 'FLOR'
    subtype: string
    fromPlayerId: string
    toPlayerId: string
    currentValue: number
    chainState: Record<string, unknown>
    allowedResponses: Array<'QUIERO' | 'NO_QUIERO'>
  } | null
  log: Array<{
    id: string
    type: string
    playerId: string
    data: Record<string, unknown>
    timestamp: number
  }>
  winnerTeam: 'A' | 'B' | null
  isFinished: boolean
}

