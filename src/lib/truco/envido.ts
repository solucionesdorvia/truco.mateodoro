import { Card, Suit, ENVIDO_VALUES } from './types'

/**
 * Calculate envido points for a hand
 * Returns the best envido score possible with the cards
 */
export function calculateEnvidoPoints(cards: Card[]): number {
  if (cards.length === 0) return 0
  
  // Group cards by suit
  const bySuit = new Map<Suit, Card[]>()
  for (const card of cards) {
    const existing = bySuit.get(card.suit) || []
    existing.push(card)
    bySuit.set(card.suit, existing)
  }
  
  let maxPoints = 0
  
  // Calculate points for each suit
  const suits: Suit[] = ['espada', 'basto', 'oro', 'copa']
  for (const suit of suits) {
    const suitCards = bySuit.get(suit)
    if (!suitCards) continue
    
    let points = 0
    
    if (suitCards.length >= 2) {
      // Two or more cards of same suit: 20 + sum of two highest value cards
      const values = suitCards.map((c: Card) => ENVIDO_VALUES[c.number] ?? 0).sort((a: number, b: number) => b - a)
      points = 20 + values[0] + values[1]
    } else if (suitCards.length === 1) {
      // Single card: just its value
      points = ENVIDO_VALUES[suitCards[0].number] ?? 0
    }
    
    maxPoints = Math.max(maxPoints, points)
  }
  
  // If no cards of same suit, return highest single card value
  if (maxPoints === 0) {
    for (const card of cards) {
      maxPoints = Math.max(maxPoints, ENVIDO_VALUES[card.number] ?? 0)
    }
  }
  
  return maxPoints
}

/**
 * Check if a hand has Flor (3 cards of same suit)
 */
export function hasFlor(cards: Card[]): boolean {
  if (cards.length !== 3) return false
  
  const suit = cards[0].suit
  return cards.every(c => c.suit === suit)
}

/**
 * Calculate Flor points (when all 3 cards are same suit)
 * Flor = 20 + sum of all three card values
 */
export function calculateFlorPoints(cards: Card[]): number {
  if (!hasFlor(cards)) return 0
  
  const sum = cards.reduce((acc, card) => acc + (ENVIDO_VALUES[card.number] ?? 0), 0)
  return 20 + sum
}

/**
 * Calculate envido points to bet based on call sequence
 */
export function calculateEnvidoWager(
  calls: ('envido' | 'real_envido' | 'falta_envido' | 'envido_envido')[],
  targetScore: number,
  currentScoreLoser: number
): number {
  let total = 0
  
  for (const call of calls) {
    switch (call) {
      case 'envido':
        total += 2
        break
      case 'envido_envido':
        total += 2 // Second envido adds 2 more
        break
      case 'real_envido':
        total += 3
        break
      case 'falta_envido':
        // Falta envido: points needed to win
        total = targetScore - currentScoreLoser
        break
    }
  }
  
  return total
}

/**
 * Get points for rejecting envido
 */
export function getEnvidoRejectPoints(calls: ('envido' | 'real_envido' | 'falta_envido' | 'envido_envido')[]): number {
  if (calls.length === 0) return 0
  
  // If only envido was called, rejecting gives 1 point
  if (calls.length === 1 && calls[0] === 'envido') return 1
  
  // If envido envido was called, rejecting gives 2 points (the first envido)
  if (calls.includes('envido_envido')) return 2
  
  // If real_envido was raised, give points from previous calls
  if (calls[calls.length - 1] === 'real_envido') {
    return calls.slice(0, -1).reduce((sum, call) => {
      if (call === 'envido' || call === 'envido_envido') return sum + 2
      return sum
    }, 0) || 1
  }
  
  // If falta_envido was raised
  if (calls[calls.length - 1] === 'falta_envido') {
    return calls.slice(0, -1).reduce((sum, call) => {
      if (call === 'envido' || call === 'envido_envido') return sum + 2
      if (call === 'real_envido') return sum + 3
      return sum
    }, 0) || 1
  }
  
  return 1
}

/**
 * Calculate flor points based on calls
 */
export function calculateFlorWager(
  calls: ('flor' | 'contra_flor' | 'contra_flor_al_resto')[],
  targetScore: number,
  currentScoreLoser: number
): number {
  if (calls.includes('contra_flor_al_resto')) {
    return targetScore - currentScoreLoser
  }
  
  if (calls.includes('contra_flor')) {
    return 6 // 3 for flor + 3 for contra flor
  }
  
  if (calls.includes('flor')) {
    return 3
  }
  
  return 0
}

/**
 * Get points for rejecting flor (no quiero contra flor)
 */
export function getFlorRejectPoints(calls: ('flor' | 'contra_flor' | 'contra_flor_al_resto')[]): number {
  if (calls.includes('contra_flor_al_resto')) {
    return 6 // They get the contra flor points
  }
  
  if (calls.includes('contra_flor')) {
    return 4 // Flor (3) + partial
  }
  
  return 3 // Just the flor
}
