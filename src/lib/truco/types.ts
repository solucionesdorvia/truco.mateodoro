// Spanish deck suits
export type Suit = 'espada' | 'basto' | 'oro' | 'copa'

// Card representation
export interface Card {
  number: number // 1-12 (excluding 8, 9)
  suit: Suit
  id: string // unique identifier: "1-espada", "3-oro", etc.
}

// Truco calls hierarchy
export type TrucoCall = 'truco' | 'retruco' | 'vale_cuatro'

// Envido calls
export type EnvidoCall = 'envido' | 'real_envido' | 'falta_envido' | 'envido_envido'

// Flor calls
export type FlorCall = 'flor' | 'contra_flor' | 'contra_flor_al_resto'

// All possible chants/calls
export type Chant = TrucoCall | EnvidoCall | FlorCall

// Response to a chant
export type ChantResponse = 'accept' | 'reject'

// Player in game state
export interface GamePlayer {
  oderId: string
  odername: string
  team: 'A' | 'B'
  seatIndex: number
  cards: Card[]
  hasFlor: boolean
  envidoPoints: number
  isConnected: boolean
}

// Single baza (trick) result
export interface Baza {
  cardA: Card | null // Best card played by team A
  cardB: Card | null // Best card played by team B
  playerCardA: string | null // User ID who played the card
  playerCardB: string | null
  winner: 'A' | 'B' | 'tie' | null
}

// Round state (one hand)
export interface RoundState {
  roundNumber: number
  handPlayer: string // User ID of "mano" player
  bazas: Baza[]
  currentBazaIndex: number
  playedCardsThisBaza: Map<string, Card> // playerId -> card
  trucoState: {
    level: number // 0=none, 1=truco, 2=retruco, 3=vale_cuatro
    pendingCall: TrucoCall | null
    calledBy: string | null // User ID
    accepted: boolean
  }
  envidoState: {
    called: boolean
    calls: EnvidoCall[]
    pendingCall: EnvidoCall | null
    calledBy: string | null
    accepted: boolean
    resolved: boolean
    points: number // Total points at stake
    winnerId: string | null
    winnerTeam: 'A' | 'B' | null
    responses: Map<string, number> // playerId -> envido points declared
  }
  florState: {
    enabled: boolean
    called: boolean
    calls: FlorCall[]
    pendingCall: FlorCall | null
    calledBy: string | null
    accepted: boolean
    resolved: boolean
    points: number
    winnerId: string | null
    winnerTeam: 'A' | 'B' | null
    playersWithFlor: string[] // User IDs
    declared: Map<string, boolean> // playerId -> has declared
  }
  mazoState: {
    teamWentToMazo: 'A' | 'B' | null
    playerId: string | null
  }
  currentTurn: string // User ID whose turn it is
  canPlayCard: boolean
  waitingForResponse: string | null // User ID who must respond to a chant
}

// Full game state
export interface GameState {
  roomId: string
  players: GamePlayer[]
  scoreA: number
  scoreB: number
  targetScore: number
  florEnabled: boolean
  currentRound: RoundState | null
  deck: Card[]
  winner: 'A' | 'B' | null
  isFinished: boolean
  lastAction: {
    type: string
    playerId: string
    data: unknown
    timestamp: number
  } | null
}

// Card hierarchy value (lower = better)
export const CARD_HIERARCHY: Record<string, number> = {
  '1-espada': 1,  // Ancho de espadas - BEST
  '1-basto': 2,   // Ancho de bastos
  '7-espada': 3,  // Siete de espadas
  '7-oro': 4,     // Siete de oro
  '3-espada': 5,
  '3-basto': 5,
  '3-oro': 5,
  '3-copa': 5,
  '2-espada': 6,
  '2-basto': 6,
  '2-oro': 6,
  '2-copa': 6,
  '1-oro': 7,     // Ancho falso
  '1-copa': 7,
  '12-espada': 8,
  '12-basto': 8,
  '12-oro': 8,
  '12-copa': 8,
  '11-espada': 9,
  '11-basto': 9,
  '11-oro': 9,
  '11-copa': 9,
  '10-espada': 10,
  '10-basto': 10,
  '10-oro': 10,
  '10-copa': 10,
  '7-copa': 11,
  '7-basto': 11,
  '6-espada': 12,
  '6-basto': 12,
  '6-oro': 12,
  '6-copa': 12,
  '5-espada': 13,
  '5-basto': 13,
  '5-oro': 13,
  '5-copa': 13,
  '4-espada': 14,
  '4-basto': 14,
  '4-oro': 14,
  '4-copa': 14,
}

// Envido point values for cards
export const ENVIDO_VALUES: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  10: 0, // Figures count as 0
  11: 0,
  12: 0,
}

// Points awarded for different truco levels
export const TRUCO_POINTS: Record<number, number> = {
  0: 1,  // No truco called
  1: 2,  // Truco
  2: 3,  // Retruco
  3: 4,  // Vale Cuatro
}

