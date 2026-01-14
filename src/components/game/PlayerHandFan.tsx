'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { TrucoCard } from './TrucoCard'

interface Card {
  id: string
  number: number
  suit: 'espada' | 'basto' | 'oro' | 'copa'
}

interface PlayerHandFanProps {
  cards: Card[]
  selectedCard: string | null
  onSelectCard: (cardId: string) => void
  isMyTurn: boolean
  canPlayCard: boolean
  onPlayCard: () => void
}

export function PlayerHandFan({
  cards,
  selectedCard,
  onSelectCard,
  isMyTurn,
  canPlayCard,
  onPlayCard,
}: PlayerHandFanProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
  const totalCards = cards.length
  const fanAngle = 25 // Ángulo total del abanico
  const angleStep = totalCards > 1 ? fanAngle / (totalCards - 1) : 0
  const startAngle = -fanAngle / 2
  
  const getCardStyle = (index: number, cardId: string) => {
    const isHovered = hoveredCard === cardId
    const isSelected = selectedCard === cardId
    const baseAngle = totalCards > 1 ? startAngle + (index * angleStep) : 0
    
    // Offset horizontal basado en posición
    const horizontalOffset = (index - (totalCards - 1) / 2) * 60
    
    // Levantar carta en hover/select
    const liftAmount = isSelected ? -40 : isHovered ? -20 : 0
    
    return {
      transform: `
        translateX(${horizontalOffset}px) 
        translateY(${liftAmount}px) 
        rotate(${baseAngle}deg)
      `,
      transformOrigin: 'bottom center',
      zIndex: isHovered || isSelected ? 50 : index + 10,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }
  
  const handleCardClick = (cardId: string) => {
    if (!isMyTurn || !canPlayCard) return
    
    if (selectedCard === cardId) {
      // Doble click = jugar
      onPlayCard()
    } else {
      onSelectCard(cardId)
    }
  }
  
  return (
    <div className="relative flex justify-center items-end h-48 sm:h-56">
      {/* Contenedor de cartas */}
      <div className="relative flex items-end justify-center">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={cn(
              "absolute cursor-pointer",
              !isMyTurn && "opacity-70 cursor-not-allowed",
              !canPlayCard && "cursor-not-allowed"
            )}
            style={getCardStyle(index, card.id)}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick(card.id)}
          >
            <TrucoCard
              number={card.number}
              suit={card.suit}
              size="hand"
              isSelected={selectedCard === card.id}
              isPlayable={isMyTurn && canPlayCard}
              className={cn(
                "transition-all duration-200",
                selectedCard === card.id && "ring-4 ring-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)]"
              )}
            />
          </div>
        ))}
      </div>
      
      {/* Indicador de turno */}
      {isMyTurn && canPlayCard && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <div className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 backdrop-blur-sm">
            <span className="text-amber-400 text-sm font-bold animate-pulse">
              {selectedCard ? '¡Toca de nuevo para jugar!' : '¡Tu turno!'}
            </span>
          </div>
        </div>
      )}
      
      {/* Botón jugar carta (aparece cuando hay carta seleccionada) */}
      {selectedCard && isMyTurn && canPlayCard && (
        <button
          onClick={onPlayCard}
          className={cn(
            "absolute -top-20 left-1/2 -translate-x-1/2",
            "px-8 py-3 rounded-2xl",
            "bg-gradient-to-b from-emerald-500 to-emerald-600",
            "text-white font-bold text-lg uppercase tracking-wide",
            "shadow-[0_8px_32px_rgba(16,185,129,0.4)]",
            "hover:shadow-[0_8px_40px_rgba(16,185,129,0.6)]",
            "active:scale-95 transition-all duration-200",
            "border-2 border-emerald-400/50",
            "animate-in fade-in zoom-in duration-200"
          )}
        >
          Jugar
        </button>
      )}
    </div>
  )
}

