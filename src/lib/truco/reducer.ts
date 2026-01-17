import { dealCards, buildDeck } from './deck'
import {
  calculateEnvidoValue,
  calculateFlorValue,
  compareTrucoCards,
  envidoCallPoints,
  envidoRejectPoints,
  florPoints,
  hasFlor,
  nextTrucoCall,
} from './rules'
import {
  CallResponse,
  EnvidoCall,
  Match,
  MatchAction,
  MatchState,
  PendingCall,
  PlayerState,
  Team,
  TrucoCall,
} from './types'

interface CreateMatchParams {
  id: string
  players: Array<{
    playerId: string
    name: string
    team: Team
    seatIndex: number
    isConnected?: boolean
  }>
  targetScore: 15 | 30
  florEnabled: boolean
}

function createLogEntry(type: string, playerId: string, data: Record<string, unknown>) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    playerId,
    data,
    timestamp: Date.now(),
  }
}

function getPlayer(match: Match, playerId: string): PlayerState {
  const player = match.players.find(p => p.playerId === playerId)
  if (!player) {
    throw new Error('Jugador no encontrado')
  }
  return player
}

function getOpponentId(match: Match, playerId: string): string {
  const opponent = match.players.find(p => p.playerId !== playerId)
  if (!opponent) {
    throw new Error('Rival no encontrado')
  }
  return opponent.playerId
}

function getTeam(match: Match, playerId: string): Team {
  return getPlayer(match, playerId).team
}

function addPoints(match: Match, team: Team, points: number) {
  if (team === 'A') {
    match.score.teamA += points
  } else {
    match.score.teamB += points
  }
}

function updateWinner(match: Match) {
  if (match.score.teamA >= match.score.target) {
    match.winnerTeam = 'A'
    match.isFinished = true
    match.status = 'MATCH_END'
  } else if (match.score.teamB >= match.score.target) {
    match.winnerTeam = 'B'
    match.isFinished = true
    match.status = 'MATCH_END'
  }
}

function resolveTrickWinner(match: Match, trickIndex: number) {
  const trick = match.hand?.tricks[trickIndex]
  if (!trick || trick.plays.length < 2) return

  const [playA, playB] = trick.plays
  const result = compareTrucoCards(playA.card, playB.card)
  if (result === 'tie') {
    trick.winnerTeam = 'tie'
  } else {
    const winnerPlay = result === 'A' ? playA : playB
    trick.winnerTeam = getTeam(match, winnerPlay.playerId)
  }
}

function determineHandWinner(match: Match): Team | null {
  const hand = match.hand
  if (!hand) return null

  const manoTeam = getTeam(match, hand.manoPlayerId)
  const winners = hand.tricks.map(trick => trick.winnerTeam)
  const playedTricks = winners.filter(w => w !== null).length

  if (winners[0] && winners[1]) {
    if (winners[0] === winners[1] && winners[0] !== 'tie') return winners[0]
    if (winners[0] === 'tie' && winners[1] !== 'tie') return winners[1] as Team
    if (winners[0] !== 'tie' && winners[1] === 'tie') return winners[0] as Team
    if (winners[0] !== winners[1] && winners[0] !== 'tie' && winners[1] !== 'tie') {
      if (winners[2] && winners[2] !== 'tie') return winners[2] as Team
      if (winners[2] === 'tie') return manoTeam
    }
  }

  if (playedTricks === 2 && winners[0] === 'tie' && winners[1] === 'tie') {
    return manoTeam
  }

  if (playedTricks === 3) {
    const teamAWins = winners.filter(w => w === 'A').length
    const teamBWins = winners.filter(w => w === 'B').length
    if (teamAWins > teamBWins) return 'A'
    if (teamBWins > teamAWins) return 'B'
    return manoTeam
  }

  return null
}

function endHand(match: Match, winnerTeam: Team, reason: string, points: number) {
  match.status = 'HAND_END'
  match.hand = match.hand
    ? { ...match.hand, canPlayCard: false }
    : match.hand

  addPoints(match, winnerTeam, points)
  match.log.push(createLogEntry('HAND_END', 'system', { winnerTeam, reason, points }))
  updateWinner(match)
}

function resolveEnvido(match: Match, accepted: boolean, responderId: string) {
  const callerId = match.pendingCall?.fromPlayerId
  if (!callerId) return

  if (!accepted) {
    const points = envidoRejectPoints(match.envido.calls)
    addPoints(match, getTeam(match, callerId), points)
    match.envido.resolved = true
    match.envido.points = points
    match.envido.winnerTeam = getTeam(match, callerId)
    match.log.push(createLogEntry('ENVIDO_REJECTED', responderId, { callerId, points }))
    updateWinner(match)
    return
  }

  const manoTeam = match.hand ? getTeam(match, match.hand.manoPlayerId) : 'A'
  let winnerTeam: Team = manoTeam
  let maxValue = -1

  for (const player of match.players) {
    if (player.envidoValue > maxValue) {
      maxValue = player.envidoValue
      winnerTeam = player.team
    } else if (player.envidoValue === maxValue && player.team === manoTeam) {
      winnerTeam = player.team
    }
  }

  const loserScore = Math.min(match.score.teamA, match.score.teamB)
  const points = envidoCallPoints(match.envido.calls, match.score.target, loserScore)
  addPoints(match, winnerTeam, points)
  match.envido.resolved = true
  match.envido.points = points
  match.envido.winnerTeam = winnerTeam
  match.log.push(createLogEntry('ENVIDO_ACCEPTED', responderId, { winnerTeam, points }))
  updateWinner(match)
}

function resolveFlor(match: Match, accepted: boolean, responderId: string) {
  const callerId = match.pendingCall?.fromPlayerId
  if (!callerId) return

  if (!accepted) {
    const points = florPoints(['FLOR'])
    addPoints(match, getTeam(match, callerId), points)
    match.flor.resolved = true
    match.flor.points = points
    match.flor.winnerTeam = getTeam(match, callerId)
    match.log.push(createLogEntry('FLOR_REJECTED', responderId, { callerId, points }))
    updateWinner(match)
    return
  }

  const manoTeam = match.hand ? getTeam(match, match.hand.manoPlayerId) : 'A'
  let winnerTeam: Team = manoTeam
  let maxValue = -1

  for (const player of match.players) {
    const value = calculateFlorValue(player.handCards)
    if (value > maxValue) {
      maxValue = value
      winnerTeam = player.team
    } else if (value === maxValue && player.team === manoTeam) {
      winnerTeam = player.team
    }
  }

  const points = florPoints(['FLOR'])
  addPoints(match, winnerTeam, points)
  match.flor.resolved = true
  match.flor.points = points
  match.flor.winnerTeam = winnerTeam
  match.log.push(createLogEntry('FLOR_ACCEPTED', responderId, { winnerTeam, points }))
  updateWinner(match)
}

function normalizeEnvidoCall(calls: EnvidoCall[], call: EnvidoCall): EnvidoCall {
  if (call === 'ENVIDO' && calls.includes('ENVIDO')) return 'ENVIDO_ENVIDO'
  return call
}

function canAddEnvidoCall(calls: EnvidoCall[], call: EnvidoCall): boolean {
  if (calls.includes('FALTA_ENVIDO')) return false
  if (call === 'ENVIDO') {
    if (calls.includes('ENVIDO_ENVIDO')) return false
    return true
  }
  if (call === 'ENVIDO_ENVIDO') {
    return calls.includes('ENVIDO') && !calls.includes('ENVIDO_ENVIDO')
  }
  if (call === 'REAL_ENVIDO' && calls.includes('REAL_ENVIDO')) return false
  if (call === 'FALTA_ENVIDO' && calls.includes('FALTA_ENVIDO')) return false
  return true
}

function getTrucoRejectPoints(subtype: TrucoCall): number {
  if (subtype === 'TRUCO') return 1
  if (subtype === 'RETRUCO') return 2
  return 3
}

export function createMatch(params: CreateMatchParams): Match {
  return {
    id: params.id,
    status: 'READY',
    players: params.players.map(player => ({
      playerId: player.playerId,
      name: player.name,
      team: player.team,
      seatIndex: player.seatIndex,
      handCards: [],
      playedCards: [],
      hasFlor: false,
      envidoValue: 0,
      isConnected: player.isConnected ?? true,
    })),
    manoIndex: 0,
    hand: null,
    score: {
      teamA: 0,
      teamB: 0,
      target: params.targetScore,
      handValue: 1,
    },
    settings: {
      targetScore: params.targetScore,
      florEnabled: params.florEnabled,
      florBlocksEnvido: true,
    },
    truco: {
      level: 0,
      accepted: false,
      lastCalledBy: null,
    },
    envido: {
      called: false,
      calls: [],
      resolved: false,
      points: 0,
      winnerTeam: null,
    },
    flor: {
      enabled: params.florEnabled,
      called: false,
      resolved: false,
      points: 0,
      winnerTeam: null,
    },
    pendingCall: null,
    log: [],
    winnerTeam: null,
    isFinished: false,
  }
}

export function dealHand(match: Match): Match {
  if (match.status === 'MATCH_END') return match
  const deck = buildDeck()
  const { hands } = dealCards(deck, match.players.length)

  match.players = match.players.map((player, index) => {
    const handCards = hands[index]
    return {
      ...player,
      handCards,
      playedCards: [],
      envidoValue: calculateEnvidoValue(handCards),
      hasFlor: hasFlor(handCards),
    }
  })

  const manoPlayer = match.players[match.manoIndex % match.players.length]
  match.hand = {
    state: 'TRICK_1',
    manoPlayerId: manoPlayer.playerId,
    currentTrickIndex: 0,
    tricks: [
      { index: 0, plays: [], winnerTeam: null },
      { index: 1, plays: [], winnerTeam: null },
      { index: 2, plays: [], winnerTeam: null },
    ],
    turnPlayerId: manoPlayer.playerId,
    canPlayCard: true,
  }

  match.status = 'PLAYING'
  match.score.handValue = 1
  match.truco = { level: 0, accepted: false, lastCalledBy: null }
  match.envido = { called: false, calls: [], resolved: false, points: 0, winnerTeam: null }
  match.flor = { enabled: match.settings.florEnabled, called: false, resolved: false, points: 0, winnerTeam: null }
  match.pendingCall = null
  match.log.push(createLogEntry('HAND_DEALT', 'system', { manoPlayerId: manoPlayer.playerId }))

  return match
}

export function applyAction(match: Match, action: MatchAction): Match {
  if (match.status === 'MATCH_END') return match

  switch (action.type) {
    case 'DEAL_HAND': {
      if (match.status === 'READY' || match.status === 'HAND_END') {
        match.manoIndex = match.status === 'HAND_END' ? match.manoIndex + 1 : match.manoIndex
        return dealHand(match)
      }
      return match
    }
    case 'PLAY_CARD': {
      const hand = match.hand
      if (!hand || match.status !== 'PLAYING') throw new Error('No hay mano activa')
      if (match.pendingCall) throw new Error('Se espera respuesta a un canto')
      if (hand.turnPlayerId !== action.playerId) throw new Error('No es tu turno')
      if (!hand.canPlayCard) throw new Error('No puedes jugar ahora')

      const player = getPlayer(match, action.playerId)
      const cardIndex = player.handCards.findIndex(card => card.id === action.cardId)
      if (cardIndex < 0) throw new Error('Carta inválida')

      const card = player.handCards[cardIndex]
      player.handCards = player.handCards.filter((_, index) => index !== cardIndex)
      player.playedCards.push(card)

      const trick = hand.tricks[hand.currentTrickIndex]
      trick.plays.push({ playerId: action.playerId, card })

      match.log.push(createLogEntry('PLAY_CARD', action.playerId, { cardId: card.id }))

      if (trick.plays.length === 2) {
        resolveTrickWinner(match, hand.currentTrickIndex)
        const winnerTeam = determineHandWinner(match)

        if (winnerTeam) {
          const points = match.truco.level + 1
          endHand(match, winnerTeam, 'TRICKS', points)
          return match
        }

        if (hand.currentTrickIndex < 2) {
          hand.currentTrickIndex += 1
          hand.state = hand.currentTrickIndex === 1 ? 'TRICK_2' : 'TRICK_3'
          const lastTrick = hand.tricks[hand.currentTrickIndex - 1]
          if (lastTrick.winnerTeam === 'tie') {
            hand.turnPlayerId = hand.manoPlayerId
          } else {
            const winningPlay = lastTrick.plays.find(
              play => getTeam(match, play.playerId) === lastTrick.winnerTeam
            )
            hand.turnPlayerId = winningPlay?.playerId ?? hand.manoPlayerId
          }
        }
      } else {
        hand.turnPlayerId = getOpponentId(match, action.playerId)
      }
      return match
    }
    case 'CALL_TRUCO': {
      const hand = match.hand
      if (!hand || match.status !== 'PLAYING') throw new Error('No hay mano activa')
      const isCounterCall =
        match.pendingCall?.type === 'TRUCO' && match.pendingCall.toPlayerId === action.playerId
      if (match.pendingCall && !isCounterCall) throw new Error('Ya hay un canto pendiente')
      if (!isCounterCall && hand.turnPlayerId !== action.playerId) {
        throw new Error('Solo podés cantar en tu turno')
      }

      const expectedCall = nextTrucoCall(match.truco.level)
      const nextCall = action.call ?? expectedCall
      if (!nextCall) throw new Error('No se puede subir más el truco')
      if (expectedCall && nextCall !== expectedCall) {
        throw new Error('Canto de truco inválido')
      }

      const opponentId = getOpponentId(match, action.playerId)
      const trucoLevel = match.truco.level + 1
      const pending: PendingCall = {
        type: 'TRUCO',
        subtype: nextCall,
        fromPlayerId: action.playerId,
        toPlayerId: opponentId,
        currentValue: trucoLevel + 1,
        chainState: { trucoLevel },
        allowedResponses: ['QUIERO', 'NO_QUIERO'],
      }

      match.pendingCall = pending
      match.truco.lastCalledBy = action.playerId
      hand.canPlayCard = false
      match.log.push(createLogEntry('CALL_TRUCO', action.playerId, { call: nextCall }))
      return match
    }
    case 'CALL_ENVIDO': {
      const hand = match.hand
      if (!hand || match.status !== 'PLAYING') throw new Error('No hay mano activa')

      const hasAnyFlor = match.settings.florEnabled && match.players.some(p => p.hasFlor)
      if (match.settings.florBlocksEnvido && hasAnyFlor) {
        throw new Error('Hay flor: el envido no corre')
      }

      if (hand.currentTrickIndex > 0 || hand.tricks[0].plays.length > 0) {
        throw new Error('El envido solo se canta antes de la primera carta')
      }

      if (match.pendingCall && match.pendingCall.type !== 'ENVIDO') {
        throw new Error('Hay otro canto pendiente')
      }

      const callerId = action.playerId
      const isResponding = match.pendingCall?.toPlayerId === callerId
      if (!isResponding && hand.turnPlayerId !== callerId) {
        throw new Error('Solo podés cantar en tu turno')
      }

      if (!canAddEnvidoCall(match.envido.calls, action.call)) {
        throw new Error('No se puede seguir cantando envido')
      }
      const normalized = normalizeEnvidoCall(match.envido.calls, action.call)
      match.envido.called = true
      match.envido.calls = [...match.envido.calls, normalized]
      match.envido.resolved = false

      const opponentId = getOpponentId(match, callerId)
      match.pendingCall = {
        type: 'ENVIDO',
        subtype: normalized,
        fromPlayerId: callerId,
        toPlayerId: opponentId,
        currentValue: 0,
        chainState: { envidoCalls: match.envido.calls },
        allowedResponses: ['QUIERO', 'NO_QUIERO'],
      }
      hand.canPlayCard = false

      match.log.push(createLogEntry('CALL_ENVIDO', callerId, { call: normalized }))
      return match
    }
    case 'CALL_FLOR': {
      const hand = match.hand
      if (!hand || match.status !== 'PLAYING') throw new Error('No hay mano activa')
      if (!match.settings.florEnabled) throw new Error('Flor deshabilitada')
      if (hand.currentTrickIndex > 0 || hand.tricks[0].plays.length > 0) {
        throw new Error('La flor se canta antes de la primera carta')
      }
      if (match.pendingCall) throw new Error('Hay un canto pendiente')

      const caller = getPlayer(match, action.playerId)
      if (!caller.hasFlor) throw new Error('No tenés flor')

      match.flor.called = true
      const opponent = match.players.find(p => p.playerId !== caller.playerId)
      const opponentHasFlor = opponent ? opponent.hasFlor : false

      if (opponent && opponentHasFlor) {
        match.pendingCall = {
          type: 'FLOR',
          subtype: 'FLOR',
          fromPlayerId: caller.playerId,
          toPlayerId: opponent.playerId,
          currentValue: 3,
          chainState: {},
          allowedResponses: ['QUIERO', 'NO_QUIERO'],
        }
        hand.canPlayCard = false
      } else {
        const points = florPoints(['FLOR'])
        match.flor.resolved = true
        match.flor.points = points
        match.flor.winnerTeam = caller.team
        addPoints(match, caller.team, points)
        match.log.push(createLogEntry('FLOR_AUTO', caller.playerId, { points }))
        updateWinner(match)
      }

      match.log.push(createLogEntry('CALL_FLOR', caller.playerId, {}))
      return match
    }
    case 'RESPOND_CALL': {
      const hand = match.hand
      if (!hand || match.status !== 'PLAYING') throw new Error('No hay mano activa')
      const pending = match.pendingCall
      if (!pending) throw new Error('No hay canto pendiente')
      if (pending.toPlayerId !== action.playerId) throw new Error('No es tu turno de responder')

      const accepted = action.response === 'QUIERO'
      match.pendingCall = null
      hand.canPlayCard = true

      if (pending.type === 'TRUCO') {
        if (accepted) {
          match.truco.level = pending.chainState.trucoLevel ?? match.truco.level + 1
          match.truco.accepted = true
          match.log.push(createLogEntry('TRUCO_ACCEPTED', action.playerId, { level: match.truco.level }))
        } else {
          const winnerTeam = getTeam(match, pending.fromPlayerId)
          const points = getTrucoRejectPoints(pending.subtype as TrucoCall)
          match.log.push(createLogEntry('TRUCO_REJECTED', action.playerId, { winnerTeam, points }))
          endHand(match, winnerTeam, 'TRUCO_REJECT', points)
        }
      }

      if (pending.type === 'ENVIDO') {
        resolveEnvido(match, accepted, action.playerId)
        match.log.push(createLogEntry('ENVIDO_RESPONSE', action.playerId, { response: action.response }))
      }

      if (pending.type === 'FLOR') {
        resolveFlor(match, accepted, action.playerId)
        match.log.push(createLogEntry('FLOR_RESPONSE', action.playerId, { response: action.response }))
      }

      return match
    }
    case 'FOLD_TO_MAZO': {
      const hand = match.hand
      if (!hand || match.status !== 'PLAYING') throw new Error('No hay mano activa')

      const foldingTeam = getTeam(match, action.playerId)
      const winnerTeam: Team = foldingTeam === 'A' ? 'B' : 'A'

      let points = match.truco.level > 0 ? match.truco.level + 1 : 1
      if (match.pendingCall?.type === 'TRUCO' && match.pendingCall.toPlayerId === action.playerId) {
        points = getTrucoRejectPoints(match.pendingCall.subtype as TrucoCall)
      }

      if (match.pendingCall?.type === 'ENVIDO' && match.pendingCall.toPlayerId === action.playerId) {
        const extra = envidoRejectPoints(match.envido.calls)
        addPoints(match, getTeam(match, match.pendingCall.fromPlayerId), extra)
      }

      if (match.pendingCall?.type === 'FLOR' && match.pendingCall.toPlayerId === action.playerId) {
        const extra = florPoints(['FLOR'])
        addPoints(match, getTeam(match, match.pendingCall.fromPlayerId), extra)
      }

      match.pendingCall = null
      endHand(match, winnerTeam, 'MAZO', points)
      match.log.push(createLogEntry('FOLD_TO_MAZO', action.playerId, { winnerTeam, points }))
      return match
    }
    default:
      return match
  }
}

export function serializeMatch(match: Match): string {
  return JSON.stringify(match)
}

export function deserializeMatch(json: string): Match {
  return JSON.parse(json) as Match
}

export function getPlayerView(match: Match, playerId: string): Match {
  return {
    ...match,
    players: match.players.map(player => {
      if (player.playerId === playerId) return player
      return {
        ...player,
        handCards: player.handCards.map(() => ({ id: 'hidden', suit: 'espada', number: 0 })),
        envidoValue: 0,
      }
    }),
  }
}
