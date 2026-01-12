import {
  Card,
  GameState,
  GamePlayer,
  RoundState,
  Baza,
  TrucoCall,
  EnvidoCall,
  FlorCall,
  ChantResponse,
  CARD_HIERARCHY,
  TRUCO_POINTS,
} from './types'
import { createDeck, dealCards } from './deck'
import {
  calculateEnvidoPoints,
  hasFlor,
  calculateEnvidoWager,
  getEnvidoRejectPoints,
} from './envido'

interface PlayerInfo {
  oderId: string
  username: string
  team: 'A' | 'B'
  seatIndex: number
}

/**
 * Initialize a new game state
 */
export function initializeGame(
  roomId: string,
  players: PlayerInfo[],
  targetScore: number,
  florEnabled: boolean
): GameState {
  const gamePlayers: GamePlayer[] = players.map(p => ({
    oderId: p.oderId,
    odername: p.username,
    team: p.team,
    seatIndex: p.seatIndex,
    cards: [],
    hasFlor: false,
    envidoPoints: 0,
    isConnected: true,
  }))
  
  const gameState: GameState = {
    roomId,
    players: gamePlayers,
    scoreA: 0,
    scoreB: 0,
    targetScore,
    florEnabled,
    currentRound: null,
    deck: createDeck(),
    winner: null,
    isFinished: false,
    lastAction: null,
  }
  
  return gameState
}

/**
 * Start a new round
 */
export function startNewRound(state: GameState): GameState {
  const newState = { ...state }
  const roundNumber = (state.currentRound?.roundNumber ?? 0) + 1
  
  // Deal cards
  const { hands } = dealCards(createDeck(), newState.players.length)
  
  // Assign cards to players and calculate envido/flor
  newState.players = newState.players.map((player, index) => ({
    ...player,
    cards: hands[index],
    envidoPoints: calculateEnvidoPoints(hands[index]),
    hasFlor: hasFlor(hands[index]),
  }))
  
  // Determine "mano" (hand) player - rotates each round
  // In the first round, it's the first player of team A
  // Then rotates clockwise
  const manoIndex = (roundNumber - 1) % newState.players.length
  const manoPlayer = newState.players[manoIndex]
  
  // Find players with flor
  const playersWithFlor = newState.florEnabled
    ? newState.players.filter(p => p.hasFlor).map(p => p.oderId)
    : []
  
  // Create new round state
  const round: RoundState = {
    roundNumber,
    handPlayer: manoPlayer.oderId,
    bazas: [
      { cardA: null, cardB: null, playerCardA: null, playerCardB: null, winner: null },
      { cardA: null, cardB: null, playerCardA: null, playerCardB: null, winner: null },
      { cardA: null, cardB: null, playerCardA: null, playerCardB: null, winner: null },
    ],
    currentBazaIndex: 0,
    playedCardsThisBaza: new Map(),
    trucoState: {
      level: 0,
      pendingCall: null,
      calledBy: null,
      accepted: false,
    },
    envidoState: {
      called: false,
      calls: [],
      pendingCall: null,
      calledBy: null,
      accepted: false,
      resolved: false,
      points: 0,
      winnerId: null,
      winnerTeam: null,
      responses: new Map(),
    },
    florState: {
      enabled: state.florEnabled,
      called: false,
      calls: [],
      pendingCall: null,
      calledBy: null,
      accepted: false,
      resolved: false,
      points: 0,
      winnerId: null,
      winnerTeam: null,
      playersWithFlor,
      declared: new Map(),
    },
    mazoState: {
      teamWentToMazo: null,
      playerId: null,
    },
    currentTurn: manoPlayer.oderId,
    canPlayCard: true,
    waitingForResponse: null,
  }
  
  newState.currentRound = round
  
  return newState
}

/**
 * Compare two cards using truco hierarchy
 * Returns: positive if card1 wins, negative if card2 wins, 0 if tie
 */
export function compareCards(card1: Card, card2: Card): number {
  const rank1 = CARD_HIERARCHY[card1.id]
  const rank2 = CARD_HIERARCHY[card2.id]
  
  // Lower rank = better card
  return rank2 - rank1
}

/**
 * Get the player whose turn it is next
 */
function getNextTurn(state: GameState, currentPlayerId: string): string {
  const players = state.players
  const currentIndex = players.findIndex(p => p.oderId === currentPlayerId)
  
  // Go to next player (circular)
  const nextIndex = (currentIndex + 1) % players.length
  return players[nextIndex].oderId
}

/**
 * Get the team of a player
 */
function getPlayerTeam(state: GameState, oderId: string): 'A' | 'B' {
  const player = state.players.find(p => p.oderId === oderId)
  return player?.team ?? 'A'
}

/**
 * Get the opposing team
 */
function getOpposingTeam(team: 'A' | 'B'): 'A' | 'B' {
  return team === 'A' ? 'B' : 'A'
}

/**
 * Check if envido can be called
 */
export function canCallEnvido(state: GameState, playerId: string): boolean {
  const round = state.currentRound
  if (!round) return false
  
  // Can only call envido in the first baza before any cards are played
  if (round.currentBazaIndex > 0) return false
  if (round.playedCardsThisBaza.size > 0) return false
  
  // Cannot call if truco has been accepted
  if (round.trucoState.accepted) return false
  
  // Cannot call if envido is already resolved
  if (round.envidoState.resolved) return false
  
  // Cannot call if already called by same team
  if (round.envidoState.calledBy) {
    const callerTeam = getPlayerTeam(state, round.envidoState.calledBy)
    const playerTeam = getPlayerTeam(state, playerId)
    if (callerTeam === playerTeam) return false
  }
  
  // Must be the player's turn or responding to opposing team's call
  if (round.waitingForResponse && round.waitingForResponse !== playerId) return false
  
  return true
}

/**
 * Check if flor can be called
 */
export function canCallFlor(state: GameState, playerId: string): boolean {
  const round = state.currentRound
  if (!round || !round.florState.enabled) return false
  
  // Player must have flor
  const player = state.players.find(p => p.oderId === playerId)
  if (!player?.hasFlor) return false
  
  // Can only call in first baza
  if (round.currentBazaIndex > 0) return false
  
  // Cannot call if already declared
  if (round.florState.declared.get(playerId)) return false
  
  return true
}

/**
 * Check if truco can be called
 */
export function canCallTruco(state: GameState, playerId: string): boolean {
  const round = state.currentRound
  if (!round) return false
  
  // Cannot call if there's a pending response
  if (round.waitingForResponse && round.waitingForResponse !== playerId) return false
  
  // Cannot raise your own team's truco
  if (round.trucoState.calledBy) {
    const callerTeam = getPlayerTeam(state, round.trucoState.calledBy)
    const playerTeam = getPlayerTeam(state, playerId)
    if (callerTeam === playerTeam && !round.trucoState.pendingCall) return false
  }
  
  // Cannot call above vale cuatro
  if (round.trucoState.level >= 3) return false
  
  return true
}

/**
 * Get the next truco call level
 */
function getNextTrucoCall(currentLevel: number): TrucoCall | null {
  switch (currentLevel) {
    case 0: return 'truco'
    case 1: return 'retruco'
    case 2: return 'vale_cuatro'
    default: return null
  }
}

/**
 * Play a card
 */
export function playCard(state: GameState, playerId: string, cardId: string): GameState {
  const newState = { ...state }
  const round = newState.currentRound
  
  if (!round) {
    throw new Error('No hay ronda activa')
  }
  
  if (round.currentTurn !== playerId) {
    throw new Error('No es tu turno')
  }
  
  if (!round.canPlayCard) {
    throw new Error('No puedes jugar una carta ahora')
  }
  
  if (round.waitingForResponse) {
    throw new Error('Se espera respuesta a un canto')
  }
  
  // Find player and card
  const playerIndex = newState.players.findIndex(p => p.oderId === playerId)
  const player = newState.players[playerIndex]
  const cardIndex = player.cards.findIndex(c => c.id === cardId)
  
  if (cardIndex === -1) {
    throw new Error('No tienes esa carta')
  }
  
  const card = player.cards[cardIndex]
  
  // Remove card from player's hand
  newState.players[playerIndex] = {
    ...player,
    cards: player.cards.filter((_, i) => i !== cardIndex),
  }
  
  // Add card to current baza
  const baza = round.bazas[round.currentBazaIndex]
  const team = player.team
  
  if (team === 'A') {
    baza.cardA = card
    baza.playerCardA = playerId
  } else {
    baza.cardB = card
    baza.playerCardB = playerId
  }
  
  round.playedCardsThisBaza.set(playerId, card)
  
  // Record action
  newState.lastAction = {
    type: 'playCard',
    playerId,
    data: { cardId, team },
    timestamp: Date.now(),
  }
  
  // Check if all players have played this baza
  const teamAPlayed = baza.cardA !== null
  const teamBPlayed = baza.cardB !== null
  
  // In multiplayer, need to check if all players on both teams have contributed
  // For simplicity, we check if both teams have at least one card
  // (In 2v2 or 3v3, the best card per team per baza counts)
  
  if (teamAPlayed && teamBPlayed) {
    // Resolve baza
    const comparison = compareCards(baza.cardA!, baza.cardB!)
    if (comparison > 0) {
      baza.winner = 'A'
    } else if (comparison < 0) {
      baza.winner = 'B'
    } else {
      baza.winner = 'tie'
    }
    
    // Check if round is won
    const bazaWinner = checkBazasWinner(round.bazas)
    
    if (bazaWinner) {
      // Round is over
      return resolveRound(newState, bazaWinner)
    }
    
    // Move to next baza
    if (round.currentBazaIndex < 2) {
      round.currentBazaIndex++
      round.playedCardsThisBaza = new Map()
      
      // Winner of baza plays first, or hand if tie
      if (baza.winner === 'tie') {
        round.currentTurn = round.handPlayer
      } else {
        round.currentTurn = baza.winner === 'A' ? baza.playerCardA! : baza.playerCardB!
      }
    }
  } else {
    // Next player's turn
    round.currentTurn = getNextTurn(newState, playerId)
  }
  
  return newState
}

/**
 * Check who wins based on bazas
 */
function checkBazasWinner(bazas: Baza[]): 'A' | 'B' | null {
  const teamAWins = bazas.filter(b => b.winner === 'A').length
  const teamBWins = bazas.filter(b => b.winner === 'B').length
  const ties = bazas.filter(b => b.winner === 'tie').length
  const played = bazas.filter(b => b.winner !== null).length
  
  // Need 2 of 3 bazas to win (or special rules for ties)
  
  // If a team won 2, they win
  if (teamAWins >= 2) return 'A'
  if (teamBWins >= 2) return 'B'
  
  // Special tie rules
  if (played === 3) {
    // All 3 bazas played
    if (teamAWins > teamBWins) return 'A'
    if (teamBWins > teamAWins) return 'B'
    
    // If all ties or tied bazas count, "mano" wins
    // This is handled separately
  }
  
  // First baza tied, second decides
  if (played >= 2 && bazas[0].winner === 'tie') {
    if (bazas[1].winner === 'A') return 'A'
    if (bazas[1].winner === 'B') return 'B'
  }
  
  // Second baza tied, first decides
  if (played >= 2 && bazas[1].winner === 'tie') {
    if (bazas[0].winner === 'A') return 'A'
    if (bazas[0].winner === 'B') return 'B'
  }
  
  // Third baza played and all tied - mano wins (handled in caller)
  if (played === 3 && ties === 3) {
    return null // Will be resolved by mano
  }
  
  return null
}

/**
 * Resolve round and award points
 */
function resolveRound(state: GameState, winner: 'A' | 'B'): GameState {
  const newState = { ...state }
  const round = newState.currentRound!
  
  // Calculate truco points
  const trucoPoints = TRUCO_POINTS[round.trucoState.level]
  
  // Award points
  if (winner === 'A') {
    newState.scoreA += trucoPoints
  } else {
    newState.scoreB += trucoPoints
  }
  
  // Add envido points if resolved
  if (round.envidoState.resolved && round.envidoState.winnerTeam) {
    if (round.envidoState.winnerTeam === 'A') {
      newState.scoreA += round.envidoState.points
    } else {
      newState.scoreB += round.envidoState.points
    }
  }
  
  // Add flor points if resolved
  if (round.florState.resolved && round.florState.winnerTeam) {
    if (round.florState.winnerTeam === 'A') {
      newState.scoreA += round.florState.points
    } else {
      newState.scoreB += round.florState.points
    }
  }
  
  // Check for game winner
  if (newState.scoreA >= newState.targetScore) {
    newState.winner = 'A'
    newState.isFinished = true
  } else if (newState.scoreB >= newState.targetScore) {
    newState.winner = 'B'
    newState.isFinished = true
  }
  
  console.log(`[Truco] Round ${round.roundNumber} resolved. Winner: ${winner}. Score: A=${newState.scoreA}, B=${newState.scoreB}`)
  
  return newState
}

/**
 * Call truco/retruco/vale_cuatro
 */
export function callTruco(state: GameState, playerId: string): GameState {
  const newState = { ...state }
  const round = newState.currentRound!
  
  if (!canCallTruco(state, playerId)) {
    throw new Error('No puedes cantar truco ahora')
  }
  
  const nextCall = getNextTrucoCall(round.trucoState.level)
  if (!nextCall) {
    throw new Error('No hay más niveles de truco')
  }
  
  round.trucoState.pendingCall = nextCall
  round.trucoState.calledBy = playerId
  round.canPlayCard = false
  
  // Find a player from opposing team to respond
  const callerTeam = getPlayerTeam(newState, playerId)
  const opposingPlayer = newState.players.find(p => p.team !== callerTeam)
  if (opposingPlayer) {
    round.waitingForResponse = opposingPlayer.oderId
  }
  
  newState.lastAction = {
    type: 'callTruco',
    playerId,
    data: { call: nextCall },
    timestamp: Date.now(),
  }
  
  console.log(`[Truco] Player ${playerId} called ${nextCall}`)
  
  return newState
}

/**
 * Respond to truco call
 */
export function respondTruco(state: GameState, playerId: string, response: ChantResponse): GameState {
  const newState = { ...state }
  const round = newState.currentRound!
  
  if (round.waitingForResponse !== playerId) {
    throw new Error('No es tu turno de responder')
  }
  
  if (!round.trucoState.pendingCall) {
    throw new Error('No hay truco pendiente')
  }
  
  if (response === 'accept') {
    // Accept: increase level
    round.trucoState.level++
    round.trucoState.accepted = true
    round.trucoState.pendingCall = null
    round.canPlayCard = true
    round.waitingForResponse = null
    
    newState.lastAction = {
      type: 'respondTruco',
      playerId,
      data: { response: 'accept', level: round.trucoState.level },
      timestamp: Date.now(),
    }
    
    console.log(`[Truco] Player ${playerId} accepted. Level now: ${round.trucoState.level}`)
  } else {
    // Reject: other team wins the round with previous level points
    const winnerTeam = getPlayerTeam(newState, round.trucoState.calledBy!)
    const points = TRUCO_POINTS[round.trucoState.level]
    
    if (winnerTeam === 'A') {
      newState.scoreA += points
    } else {
      newState.scoreB += points
    }
    
    newState.lastAction = {
      type: 'respondTruco',
      playerId,
      data: { response: 'reject', winnerTeam, points },
      timestamp: Date.now(),
    }
    
    console.log(`[Truco] Player ${playerId} rejected. ${winnerTeam} wins ${points} points`)
    
    // Check for game winner
    if (newState.scoreA >= newState.targetScore) {
      newState.winner = 'A'
      newState.isFinished = true
    } else if (newState.scoreB >= newState.targetScore) {
      newState.winner = 'B'
      newState.isFinished = true
    }
    
    // Round is over
    round.canPlayCard = false
    round.waitingForResponse = null
  }
  
  return newState
}

/**
 * Call envido
 */
export function callEnvido(state: GameState, playerId: string, call: EnvidoCall): GameState {
  const newState = { ...state }
  const round = newState.currentRound!
  
  if (!canCallEnvido(state, playerId)) {
    throw new Error('No puedes cantar envido ahora')
  }
  
  round.envidoState.called = true
  round.envidoState.calls.push(call)
  round.envidoState.pendingCall = call
  round.envidoState.calledBy = playerId
  round.canPlayCard = false
  
  // Find opposing player to respond
  const callerTeam = getPlayerTeam(newState, playerId)
  const opposingPlayer = newState.players.find(p => p.team !== callerTeam)
  if (opposingPlayer) {
    round.waitingForResponse = opposingPlayer.oderId
  }
  
  newState.lastAction = {
    type: 'callEnvido',
    playerId,
    data: { call },
    timestamp: Date.now(),
  }
  
  console.log(`[Truco] Player ${playerId} called ${call}`)
  
  return newState
}

/**
 * Respond to envido
 */
export function respondEnvido(state: GameState, playerId: string, response: ChantResponse): GameState {
  const newState = { ...state }
  const round = newState.currentRound!
  
  if (round.waitingForResponse !== playerId) {
    throw new Error('No es tu turno de responder')
  }
  
  if (!round.envidoState.pendingCall) {
    throw new Error('No hay envido pendiente')
  }
  
  if (response === 'accept') {
    round.envidoState.accepted = true
    round.envidoState.pendingCall = null
    
    // Calculate winner based on envido points
    const loserScore = Math.min(newState.scoreA, newState.scoreB)
    const totalPoints = calculateEnvidoWager(round.envidoState.calls, newState.targetScore, loserScore)
    
    // Find who has highest envido
    let maxPoints = 0
    let winnerId: string | null = null
    let winnerTeam: 'A' | 'B' | null = null
    
    // In case of tie, "mano" wins
    const manoPlayer = newState.players.find(p => p.oderId === round.handPlayer)
    const manoTeam = manoPlayer?.team
    
    for (const player of newState.players) {
      if (player.envidoPoints > maxPoints) {
        maxPoints = player.envidoPoints
        winnerId = player.oderId
        winnerTeam = player.team
      } else if (player.envidoPoints === maxPoints && player.team === manoTeam) {
        // Tie goes to mano's team
        winnerId = player.oderId
        winnerTeam = player.team
      }
    }
    
    round.envidoState.points = totalPoints
    round.envidoState.winnerId = winnerId
    round.envidoState.winnerTeam = winnerTeam
    round.envidoState.resolved = true
    round.canPlayCard = true
    round.waitingForResponse = null
    
    newState.lastAction = {
      type: 'respondEnvido',
      playerId,
      data: { response: 'accept', winnerId, winnerTeam, points: totalPoints },
      timestamp: Date.now(),
    }
    
    console.log(`[Truco] Envido accepted. Winner: ${winnerTeam} with ${maxPoints} points. ${totalPoints} points awarded.`)
  } else {
    // Reject
    const callerTeam = getPlayerTeam(newState, round.envidoState.calledBy!)
    const points = getEnvidoRejectPoints(round.envidoState.calls)
    
    round.envidoState.winnerTeam = callerTeam
    round.envidoState.points = points
    round.envidoState.resolved = true
    round.canPlayCard = true
    round.waitingForResponse = null
    round.envidoState.pendingCall = null
    
    newState.lastAction = {
      type: 'respondEnvido',
      playerId,
      data: { response: 'reject', winnerTeam: callerTeam, points },
      timestamp: Date.now(),
    }
    
    console.log(`[Truco] Envido rejected. ${callerTeam} wins ${points} points.`)
  }
  
  return newState
}

/**
 * Call flor
 */
export function callFlor(state: GameState, playerId: string, call: FlorCall = 'flor'): GameState {
  const newState = { ...state }
  const round = newState.currentRound!
  
  if (!canCallFlor(state, playerId)) {
    throw new Error('No puedes cantar flor')
  }
  
  round.florState.called = true
  round.florState.calls.push(call)
  round.florState.declared.set(playerId, true)
  
  // Check if opposing team has flor too
  const playerTeam = getPlayerTeam(newState, playerId)
  const opposingFlor = newState.players.some(
    p => p.team !== playerTeam && p.hasFlor && !round.florState.declared.get(p.oderId)
  )
  
  if (opposingFlor && call !== 'contra_flor' && call !== 'contra_flor_al_resto') {
    // Wait for opposing flor declaration
    const opposingPlayer = newState.players.find(
      p => p.team !== playerTeam && p.hasFlor
    )
    if (opposingPlayer) {
      round.waitingForResponse = opposingPlayer.oderId
      round.florState.pendingCall = call
      round.canPlayCard = false
    }
  } else {
    // No opposing flor, auto-win
    round.florState.winnerId = playerId
    round.florState.winnerTeam = playerTeam
    round.florState.points = 3 // Base flor points
    round.florState.resolved = true
  }
  
  newState.lastAction = {
    type: 'callFlor',
    playerId,
    data: { call },
    timestamp: Date.now(),
  }
  
  console.log(`[Truco] Player ${playerId} called ${call}`)
  
  return newState
}

/**
 * Go to mazo (fold)
 */
export function goToMazo(state: GameState, playerId: string): GameState {
  const newState = { ...state }
  const round = newState.currentRound!
  
  const playerTeam = getPlayerTeam(newState, playerId)
  const opposingTeam = getOpposingTeam(playerTeam)
  
  round.mazoState.teamWentToMazo = playerTeam
  round.mazoState.playerId = playerId
  
  // Calculate points for opposing team
  let points = 1 // Default if no truco
  
  if (round.trucoState.accepted) {
    // If truco was accepted, give full truco points
    points = TRUCO_POINTS[round.trucoState.level]
  } else if (round.trucoState.pendingCall) {
    // If truco is pending (not yet accepted), give previous level points
    points = TRUCO_POINTS[round.trucoState.level]
  }
  
  // Award points to opposing team
  if (opposingTeam === 'A') {
    newState.scoreA += points
  } else {
    newState.scoreB += points
  }
  
  newState.lastAction = {
    type: 'goToMazo',
    playerId,
    data: { team: playerTeam, points, winnerTeam: opposingTeam },
    timestamp: Date.now(),
  }
  
  console.log(`[Truco] Player ${playerId} (team ${playerTeam}) went to mazo. ${opposingTeam} wins ${points} points.`)
  
  // Check for game winner
  if (newState.scoreA >= newState.targetScore) {
    newState.winner = 'A'
    newState.isFinished = true
  } else if (newState.scoreB >= newState.targetScore) {
    newState.winner = 'B'
    newState.isFinished = true
  }
  
  // Round is over
  round.canPlayCard = false
  round.waitingForResponse = null
  
  return newState
}

/**
 * Serialize game state (for storage/transmission)
 */
export function serializeGameState(state: GameState): string {
  // Convert Maps to arrays for JSON serialization
  const serializable = {
    ...state,
    currentRound: state.currentRound ? {
      ...state.currentRound,
      playedCardsThisBaza: Array.from(state.currentRound.playedCardsThisBaza.entries()),
      envidoState: {
        ...state.currentRound.envidoState,
        responses: Array.from(state.currentRound.envidoState.responses.entries()),
      },
      florState: {
        ...state.currentRound.florState,
        declared: Array.from(state.currentRound.florState.declared.entries()),
      },
    } : null,
  }
  
  return JSON.stringify(serializable)
}

/**
 * Deserialize game state
 */
export function deserializeGameState(json: string): GameState {
  const parsed = JSON.parse(json)
  
  if (parsed.currentRound) {
    parsed.currentRound.playedCardsThisBaza = new Map(parsed.currentRound.playedCardsThisBaza)
    parsed.currentRound.envidoState.responses = new Map(parsed.currentRound.envidoState.responses)
    parsed.currentRound.florState.declared = new Map(parsed.currentRound.florState.declared)
  }
  
  return parsed as GameState
}

/**
 * Get sanitized state for a specific player (hides other players' cards)
 */
export function getPlayerView(state: GameState, oderId: string): GameState {
  const view = { ...state }
  
  view.players = state.players.map(p => {
    if (p.oderId === oderId) {
      return p // Full info for current player
    }
    return {
      ...p,
      cards: p.cards.map(() => ({ number: 0, suit: 'espada' as const, id: 'hidden' })), // Hide cards
      envidoPoints: 0, // Hide envido points until revealed
    }
  })
  
  return view
}

