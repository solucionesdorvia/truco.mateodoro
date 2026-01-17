export type Suit = 'espada' | 'basto' | 'oro' | 'copa'
export type Team = 'A' | 'B'

export interface Card {
  id: string
  suit: Suit
  number: number
}

export type MatchState =
  | 'WAITING_PLAYERS'
  | 'READY'
  | 'DEALING'
  | 'PLAYING'
  | 'HAND_END'
  | 'MATCH_END'

export type HandState = 'TRICK_1' | 'TRICK_2' | 'TRICK_3'

export type TrucoCall = 'TRUCO' | 'RETRUCO' | 'VALE_4'
export type EnvidoCall = 'ENVIDO' | 'REAL_ENVIDO' | 'FALTA_ENVIDO' | 'ENVIDO_ENVIDO'
export type FlorCall = 'FLOR'

export type CallType = 'TRUCO' | 'ENVIDO' | 'FLOR'
export type CallResponse = 'QUIERO' | 'NO_QUIERO'

export interface PlayerState {
  playerId: string
  name: string
  team: Team
  seatIndex: number
  handCards: Card[]
  playedCards: Card[]
  hasFlor: boolean
  envidoValue: number
  isConnected: boolean
}

export interface TrickPlay {
  playerId: string
  card: Card
}

export interface Trick {
  index: number
  plays: TrickPlay[]
  winnerTeam: Team | 'tie' | null
}

export interface PendingCall {
  type: CallType
  subtype: TrucoCall | EnvidoCall | FlorCall
  fromPlayerId: string
  toPlayerId: string
  currentValue: number
  chainState: {
    envidoCalls?: EnvidoCall[]
    trucoLevel?: number
  }
  allowedResponses: CallResponse[]
}

export interface MatchSettings {
  targetScore: 15 | 30
  florEnabled: boolean
  florBlocksEnvido: boolean
}

export interface MatchScore {
  teamA: number
  teamB: number
  target: number
  handValue: number
}

export interface EnvidoState {
  called: boolean
  calls: EnvidoCall[]
  resolved: boolean
  points: number
  winnerTeam: Team | null
}

export interface FlorState {
  enabled: boolean
  called: boolean
  resolved: boolean
  points: number
  winnerTeam: Team | null
}

export interface TrucoState {
  level: number
  accepted: boolean
  lastCalledBy: string | null
}

export interface HandStateData {
  state: HandState
  manoPlayerId: string
  currentTrickIndex: number
  tricks: Trick[]
  turnPlayerId: string
  canPlayCard: boolean
}

export interface MatchLogEvent {
  id: string
  type: string
  playerId: string
  data: Record<string, unknown>
  timestamp: number
}

export interface TableTrick {
  p1Card: Card | null
  p2Card: Card | null
  winner: 'P1' | 'P2' | 'TIE' | null
}

export interface Match {
  id: string
  status: MatchState
  players: PlayerState[]
  manoIndex: number
  hand: HandStateData | null
  currentTrickIndex: 0 | 1 | 2
  tableTricks: [TableTrick, TableTrick, TableTrick]
  score: MatchScore
  settings: MatchSettings
  truco: TrucoState
  envido: EnvidoState
  flor: FlorState
  pendingCall: PendingCall | null
  log: MatchLogEvent[]
  winnerTeam: Team | null
  isFinished: boolean
}

export type MatchAction =
  | { type: 'DEAL_HAND' }
  | { type: 'PLAY_CARD'; playerId: string; cardId: string }
  | { type: 'CALL_ENVIDO'; playerId: string; call: EnvidoCall }
  | { type: 'CALL_TRUCO'; playerId: string; call?: TrucoCall }
  | { type: 'CALL_FLOR'; playerId: string; call?: FlorCall }
  | { type: 'RESPOND_CALL'; playerId: string; response: CallResponse }
  | { type: 'FOLD_TO_MAZO'; playerId: string }
