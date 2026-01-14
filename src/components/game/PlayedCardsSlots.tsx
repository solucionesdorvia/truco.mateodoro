'use client'

import { cn } from '@/lib/utils'
import { TrucoCard } from './TrucoCard'

interface CardData {
  number: number
  suit: 'espada' | 'basto' | 'oro' | 'copa'
}

interface Baza {
  cardA: CardData | null
  cardB: CardData | null
  winner: 'A' | 'B' | 'tie' | null
}

interface PlayedCardsSlotsProps {
  bazas: Baza[]
  currentBazaIndex: number
  myTeam: 'A' | 'B'
}

export function PlayedCardsSlots({ bazas, currentBazaIndex, myTeam }: PlayedCardsSlotsProps) {
  // Cartas del rival (arriba) y mías (abajo)
  const opponentTeam = myTeam === 'A' ? 'B' : 'A'
  
  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      {/* Slots del rival (arriba) */}
      <div className="flex gap-2 sm:gap-4">
        {[0, 1, 2].map((idx) => {
          const baza = bazas[idx]
          const card = opponentTeam === 'A' ? baza?.cardA : baza?.cardB
          const isWinner = baza?.winner === opponentTeam
          const isCurrent = idx === currentBazaIndex
          
          return (
            <CardSlot
              key={`opponent-${idx}`}
              card={card}
              isWinner={isWinner}
              isCurrent={isCurrent}
              isPlayed={!!card}
              slotIndex={idx}
              position="top"
            />
          )
        })}
      </div>
      
      {/* Indicadores de baza en el medio */}
      <div className="flex items-center gap-3">
        {[0, 1, 2].map((idx) => {
          const baza = bazas[idx]
          const isMyWin = baza?.winner === myTeam
          const isOpponentWin = baza?.winner === opponentTeam
          const isTie = baza?.winner === 'tie'
          const isCurrent = idx === currentBazaIndex
          
          return (
            <div 
              key={`indicator-${idx}`}
              className={cn(
                "w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300",
                isMyWin && "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]",
                isOpponentWin && "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]",
                isTie && "bg-gray-500",
                !baza?.winner && isCurrent && "bg-amber-500/50 animate-pulse",
                !baza?.winner && !isCurrent && "bg-white/10 border border-white/20"
              )}
            />
          )
        })}
      </div>
      
      {/* Slots míos (abajo) */}
      <div className="flex gap-2 sm:gap-4">
        {[0, 1, 2].map((idx) => {
          const baza = bazas[idx]
          const card = myTeam === 'A' ? baza?.cardA : baza?.cardB
          const isWinner = baza?.winner === myTeam
          const isCurrent = idx === currentBazaIndex
          
          return (
            <CardSlot
              key={`mine-${idx}`}
              card={card}
              isWinner={isWinner}
              isCurrent={isCurrent}
              isPlayed={!!card}
              slotIndex={idx}
              position="bottom"
            />
          )
        })}
      </div>
    </div>
  )
}

interface CardSlotProps {
  card: CardData | null
  isWinner: boolean
  isCurrent: boolean
  isPlayed: boolean
  slotIndex: number
  position: 'top' | 'bottom'
}

function CardSlot({ card, isWinner, isCurrent, isPlayed, slotIndex, position }: CardSlotProps) {
  return (
    <div 
      className={cn(
        "relative w-14 h-20 sm:w-20 sm:h-28 rounded-xl transition-all duration-300",
        !isPlayed && "border-2 border-dashed border-white/10",
        !isPlayed && isCurrent && "border-amber-500/30 bg-amber-500/5",
        isWinner && "ring-2 ring-emerald-500/50"
      )}
    >
      {card ? (
        <div 
          className={cn(
            "absolute inset-0",
            "animate-in fade-in slide-in-from-bottom-4 duration-300",
            position === 'top' && "slide-in-from-top-4"
          )}
          style={{
            animationDelay: `${slotIndex * 50}ms`,
          }}
        >
          <TrucoCard
            number={card.number}
            suit={card.suit}
            size="played"
            className="w-full h-full"
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/10 text-xs font-medium">
            {slotIndex + 1}
          </span>
        </div>
      )}
      
      {/* Glow de victoria */}
      {isWinner && (
        <div className="absolute -inset-1 rounded-xl bg-emerald-500/20 blur-md -z-10" />
      )}
    </div>
  )
}

