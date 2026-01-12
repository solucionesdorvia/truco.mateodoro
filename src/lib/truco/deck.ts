import { Card, Suit } from './types'

const SUITS: Suit[] = ['espada', 'basto', 'oro', 'copa']
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12] // Exclude 8, 9

/**
 * Creates a full Spanish deck (40 cards, no 8s or 9s)
 */
export function createDeck(): Card[] {
  const deck: Card[] = []
  
  for (const suit of SUITS) {
    for (const number of NUMBERS) {
      deck.push({
        number,
        suit,
        id: `${number}-${suit}`,
      })
    }
  }
  
  return deck
}

/**
 * Fisher-Yates shuffle
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

/**
 * Deal cards to players
 */
export function dealCards(deck: Card[], numPlayers: number): { hands: Card[][], remainingDeck: Card[] } {
  const shuffled = shuffleDeck(deck)
  const hands: Card[][] = []
  
  // Each player gets 3 cards
  for (let i = 0; i < numPlayers; i++) {
    hands.push(shuffled.slice(i * 3, i * 3 + 3))
  }
  
  const remainingDeck = shuffled.slice(numPlayers * 3)
  
  return { hands, remainingDeck }
}

/**
 * Get card display name
 */
export function getCardName(card: Card): string {
  const numberNames: Record<number, string> = {
    1: 'Ancho',
    2: 'Dos',
    3: 'Tres',
    4: 'Cuatro',
    5: 'Cinco',
    6: 'Seis',
    7: 'Siete',
    10: 'Sota',
    11: 'Caballo',
    12: 'Rey',
  }
  
  const suitNames: Record<Suit, string> = {
    espada: 'de Espadas',
    basto: 'de Bastos',
    oro: 'de Oros',
    copa: 'de Copas',
  }
  
  return `${numberNames[card.number]} ${suitNames[card.suit]}`
}

