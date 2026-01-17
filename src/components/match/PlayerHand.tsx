'use client'

import { useCallback, useRef } from 'react'
import { TrucoCardImage } from '@/components/cards/TrucoCardImage'

interface HandCard {
  id: string
  number: number
  suit: 'espada' | 'basto' | 'oro' | 'copa'
}

interface PlayerHandProps {
  cards: HandCard[]
  selectedCardId: string | null
  canPlay: boolean
  helperTextIdle?: string
  helperTextConfirm?: string
  onSelect: (cardId: string) => void
  onPlay: (cardId: string) => void
  size?: 'sm' | 'md' | 'lg'
  doubleTapMs?: number
}

export function PlayerHand({
  cards,
  selectedCardId,
  canPlay,
  helperTextIdle = 'Tocá dos veces para tirar',
  helperTextConfirm = 'Tocá de nuevo para confirmar',
  onSelect,
  onPlay,
  size = 'lg',
  doubleTapMs = 600,
}: PlayerHandProps) {
  const lastTapRef = useRef<{ cardId: string | null; ts: number }>({ cardId: null, ts: 0 })

  const handleTap = useCallback((cardId: string) => {
    if (!canPlay) return

    const now = Date.now()
    const last = lastTapRef.current

    if (selectedCardId !== cardId) {
      onSelect(cardId)
      lastTapRef.current = { cardId, ts: now }
      return
    }

    if (last.cardId === cardId && now - last.ts <= doubleTapMs) {
      onPlay(cardId)
      lastTapRef.current = { cardId: null, ts: 0 }
      return
    }

    onSelect(cardId)
    lastTapRef.current = { cardId, ts: now }
  }, [canPlay, selectedCardId, doubleTapMs, onPlay, onSelect])

  return (
    <div className="text-center">
      <p className="text-xs text-naipe-400 mb-2">
        {selectedCardId ? helperTextConfirm : helperTextIdle}
      </p>
      <div className="flex gap-3 justify-center">
        {cards.map(card => (
          <TrucoCardImage
            key={card.id}
            suit={card.suit}
            rank={card.number}
            size={size}
            selected={selectedCardId === card.id}
            disabled={!canPlay}
            onPointerDown={() => handleTap(card.id)}
          />
        ))}
      </div>
    </div>
  )
}
