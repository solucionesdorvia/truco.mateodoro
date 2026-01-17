import { randomInt } from 'crypto'
import { Card, Suit } from './types'

const SUITS: Suit[] = ['espada', 'basto', 'oro', 'copa']
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]

export function buildDeck(): Card[] {
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

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

export function dealCards(deck: Card[], numPlayers: number): { hands: Card[][]; remainingDeck: Card[] } {
  const shuffled = shuffleDeck(deck)
  const hands: Card[][] = []

  for (let i = 0; i < numPlayers; i++) {
    hands.push(shuffled.slice(i * 3, i * 3 + 3))
  }

  const remainingDeck = shuffled.slice(numPlayers * 3)
  return { hands, remainingDeck }
}

