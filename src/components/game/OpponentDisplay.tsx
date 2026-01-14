'use client'

import { cn } from '@/lib/utils'
import { TrucoCard } from './TrucoCard'
import { Crown } from 'lucide-react'

interface Card {
  id: string
  number: number
  suit: string
}

interface Player {
  oderId: string
  odername: string
  team: 'A' | 'B'
  cards: Card[]
  isCreator?: boolean
}

interface OpponentDisplayProps {
  opponents: Player[]
  currentTurn: string | undefined
  myTeam: 'A' | 'B'
}

export function OpponentDisplay({ opponents, currentTurn, myTeam }: OpponentDisplayProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-start gap-8 sm:gap-16">
        {opponents.map((opponent) => {
          const isCurrentTurn = currentTurn === opponent.oderId
          
          return (
            <div 
              key={opponent.oderId} 
              className={cn(
                "flex flex-col items-center",
                "animate-in fade-in slide-in-from-top duration-500"
              )}
            >
              {/* Avatar y nombre */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full mb-2",
                "bg-black/40 backdrop-blur-sm border",
                isCurrentTurn 
                  ? "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                  : "border-white/10"
              )}>
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  "bg-gradient-to-br",
                  opponent.team === 'A' 
                    ? "from-blue-600 to-blue-800 text-blue-100" 
                    : "from-red-600 to-red-800 text-red-100"
                )}>
                  {opponent.odername.charAt(0).toUpperCase()}
                </div>
                
                {/* Nombre */}
                <span className={cn(
                  "text-sm font-semibold",
                  isCurrentTurn ? "text-amber-400" : "text-white/80"
                )}>
                  {opponent.odername}
                </span>
                
                {/* Indicador de turno */}
                {isCurrentTurn && (
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
                
                {/* Corona si es creador */}
                {opponent.isCreator && (
                  <Crown className="w-3 h-3 text-amber-500" />
                )}
              </div>
              
              {/* Cartas del oponente */}
              <div className="flex gap-1">
                {opponent.cards.map((card, idx) => (
                  <div 
                    key={`${opponent.oderId}-card-${idx}`}
                    className="transition-transform duration-200"
                    style={{
                      transform: `rotate(${(idx - 1) * 5}deg)`,
                    }}
                  >
                    <TrucoCard
                      number={card.number}
                      suit={card.suit as 'espada' | 'basto' | 'oro' | 'copa'}
                      isHidden={card.id === 'hidden'}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Display para compañeros de equipo (en modo 2v2 o 3v3)
export function TeammateDisplay({ teammates, currentTurn }: { teammates: Player[]; currentTurn: string | undefined }) {
  if (teammates.length === 0) return null
  
  return (
    <div className="fixed bottom-48 sm:bottom-56 left-1/2 -translate-x-1/2 z-15">
      <div className="flex items-center gap-8 sm:gap-12">
        {teammates.map((teammate) => {
          const isCurrentTurn = currentTurn === teammate.oderId
          
          return (
            <div key={teammate.oderId} className="flex flex-col items-center">
              {/* Cartas del compañero */}
              <div className="flex gap-1 mb-2">
                {teammate.cards.map((card, idx) => (
                  <div 
                    key={`${teammate.oderId}-card-${idx}`}
                    style={{
                      transform: `rotate(${(idx - 1) * 3}deg)`,
                    }}
                  >
                    <TrucoCard
                      number={card.number}
                      suit={card.suit as 'espada' | 'basto' | 'oro' | 'copa'}
                      isHidden={card.id === 'hidden'}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
              
              {/* Nombre */}
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold",
                "bg-black/30 backdrop-blur-sm border",
                isCurrentTurn 
                  ? "border-amber-500/50 text-amber-400" 
                  : "border-white/10 text-white/60"
              )}>
                {teammate.odername}
                {isCurrentTurn && " (turno)"}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

