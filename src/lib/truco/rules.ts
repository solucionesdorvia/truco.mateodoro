import { Card, EnvidoCall, FlorCall, Suit, TrucoCall } from './types'

const TRUCO_STRENGTH: Record<string, number> = {
  '1-espada': 14,
  '1-basto': 13,
  '7-espada': 12,
  '7-oro': 11,
  '3-espada': 10,
  '3-basto': 10,
  '3-oro': 10,
  '3-copa': 10,
  '2-espada': 9,
  '2-basto': 9,
  '2-oro': 9,
  '2-copa': 9,
  '1-oro': 8,
  '1-copa': 8,
  '12-espada': 7,
  '12-basto': 7,
  '12-oro': 7,
  '12-copa': 7,
  '11-espada': 6,
  '11-basto': 6,
  '11-oro': 6,
  '11-copa': 6,
  '10-espada': 5,
  '10-basto': 5,
  '10-oro': 5,
  '10-copa': 5,
  '7-basto': 4,
  '7-copa': 4,
  '6-espada': 3,
  '6-basto': 3,
  '6-oro': 3,
  '6-copa': 3,
  '5-espada': 2,
  '5-basto': 2,
  '5-oro': 2,
  '5-copa': 2,
  '4-espada': 1,
  '4-basto': 1,
  '4-oro': 1,
  '4-copa': 1,
}

const ENVIDO_VALUES: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  10: 0,
  11: 0,
  12: 0,
}

export function cardStrength(card: Card): number {
  return TRUCO_STRENGTH[card.id] ?? 0
}

export function compareTrucoCards(cardA: Card, cardB: Card): 'A' | 'B' | 'tie' {
  const strengthA = cardStrength(cardA)
  const strengthB = cardStrength(cardB)
  if (strengthA === strengthB) return 'tie'
  return strengthA > strengthB ? 'A' : 'B'
}

export function calculateEnvidoValue(cards: Card[]): number {
  if (cards.length === 0) return 0

  const bySuit = new Map<Suit, Card[]>()
  for (const card of cards) {
    const existing = bySuit.get(card.suit) ?? []
    existing.push(card)
    bySuit.set(card.suit, existing)
  }

  let maxValue = 0
  for (const [, suitCards] of bySuit) {
    if (suitCards.length >= 2) {
      const values = suitCards
        .map(card => ENVIDO_VALUES[card.number] ?? 0)
        .sort((a, b) => b - a)
      maxValue = Math.max(maxValue, 20 + values[0] + values[1])
    } else if (suitCards.length === 1) {
      maxValue = Math.max(maxValue, ENVIDO_VALUES[suitCards[0].number] ?? 0)
    }
  }

  if (maxValue === 0) {
    for (const card of cards) {
      maxValue = Math.max(maxValue, ENVIDO_VALUES[card.number] ?? 0)
    }
  }

  return maxValue
}

export function hasFlor(cards: Card[]): boolean {
  if (cards.length !== 3) return false
  const suit = cards[0].suit
  return cards.every(card => card.suit === suit)
}

export function calculateFlorValue(cards: Card[]): number {
  if (!hasFlor(cards)) return 0
  const sum = cards.reduce((acc, card) => acc + (ENVIDO_VALUES[card.number] ?? 0), 0)
  return 20 + sum
}

export function nextTrucoCall(level: number): TrucoCall | null {
  if (level === 0) return 'TRUCO'
  if (level === 1) return 'RETRUCO'
  if (level === 2) return 'VALE_4'
  return null
}

export function envidoCallPoints(calls: EnvidoCall[], targetScore: number, loserScore: number): number {
  let total = 0
  for (const call of calls) {
    if (call === 'ENVIDO' || call === 'ENVIDO_ENVIDO') {
      total += 2
    } else if (call === 'REAL_ENVIDO') {
      total += 3
    } else if (call === 'FALTA_ENVIDO') {
      total = targetScore - loserScore
    }
  }
  return total
}

export function envidoRejectPoints(calls: EnvidoCall[]): number {
  if (calls.length === 0) return 0
  if (calls.length === 1 && calls[0] === 'ENVIDO') return 1
  if (calls.includes('ENVIDO_ENVIDO')) return 2

  const last = calls[calls.length - 1]
  if (last === 'REAL_ENVIDO') {
    return calls.slice(0, -1).reduce((sum, call) => (call.startsWith('ENVIDO') ? sum + 2 : sum), 0) || 1
  }
  if (last === 'FALTA_ENVIDO') {
    return calls.slice(0, -1).reduce((sum, call) => {
      if (call.startsWith('ENVIDO')) return sum + 2
      if (call === 'REAL_ENVIDO') return sum + 3
      return sum
    }, 0) || 1
  }
  return 1
}

export function florPoints(calls: FlorCall[]): number {
  if (calls.includes('FLOR')) return 3
  return 0
}
