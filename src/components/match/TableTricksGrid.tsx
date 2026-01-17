'use client'

import { TrucoCardImage } from '@/components/cards/TrucoCardImage'
import { cn } from '@/lib/utils'

interface TableTrick {
  p1Card: { number: number; suit: string; id: string } | null
  p2Card: { number: number; suit: string; id: string } | null
  winner: 'P1' | 'P2' | 'TIE' | null
}

interface TableTricksGridProps {
  tableTricks: TableTrick[]
  currentTrickIndex: 0 | 1 | 2
  playerPerspective: {
    p1Id: string
    p2Id: string
  }
  myPlayerId: string
}

function normalizeSuit(suit: string): 'espada' | 'basto' | 'oro' | 'copa' {
  if (suit === 'espada' || suit === 'basto' || suit === 'oro' || suit === 'copa') return suit
  return 'espada'
}

export function TableTricksGrid({
  tableTricks,
  currentTrickIndex,
  playerPerspective,
  myPlayerId,
}: TableTricksGridProps) {
  const isP1Me = playerPerspective.p1Id === myPlayerId

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6">
      {tableTricks.map((trick, index) => {
        const rivalCard = isP1Me ? trick.p2Card : trick.p1Card
        const myCard = isP1Me ? trick.p1Card : trick.p2Card
        const winner = trick.winner

        const rivalWin = winner
          ? winner === 'TIE'
            ? 'tie'
            : (winner === 'P1') === !isP1Me
              ? 'win'
              : 'lose'
          : null
        const myWin = winner
          ? winner === 'TIE'
            ? 'tie'
            : (winner === 'P1') === isP1Me
              ? 'win'
              : 'lose'
          : null

        return (
          <div key={index} className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'w-[3.25rem] h-[4.5rem] sm:w-20 sm:h-28 rounded-xl border border-paño/30 flex items-center justify-center',
                !rivalCard && 'border-dashed',
                rivalWin === 'win' && 'shadow-[0_0_14px_rgba(34,197,94,0.5)] border-emerald-400/60',
                rivalWin === 'lose' && 'shadow-[0_0_14px_rgba(239,68,68,0.4)] border-red-400/50',
                rivalWin === 'tie' && 'shadow-[0_0_14px_rgba(148,163,184,0.4)] border-slate-400/50',
                index === currentTrickIndex && 'ring-1 ring-oro/50'
              )}
            >
              {rivalCard ? (
                <TrucoCardImage
                  suit={normalizeSuit(rivalCard.suit)}
                  rank={rivalCard.number}
                  size="sm"
                  className="sm:w-20 sm:h-28 animate-scale-in"
                />
              ) : (
                <span className="text-[10px] text-naipe-600">Rival</span>
              )}
            </div>
            <div
              className={cn(
                'w-[3.25rem] h-[4.5rem] sm:w-20 sm:h-28 rounded-xl border border-paño/30 flex items-center justify-center',
                !myCard && 'border-dashed',
                myWin === 'win' && 'shadow-[0_0_14px_rgba(34,197,94,0.5)] border-emerald-400/60',
                myWin === 'lose' && 'shadow-[0_0_14px_rgba(239,68,68,0.4)] border-red-400/50',
                myWin === 'tie' && 'shadow-[0_0_14px_rgba(148,163,184,0.4)] border-slate-400/50',
                index === currentTrickIndex && 'ring-1 ring-oro/50'
              )}
            >
              {myCard ? (
                <TrucoCardImage
                  suit={normalizeSuit(myCard.suit)}
                  rank={myCard.number}
                  size="sm"
                  className="sm:w-20 sm:h-28 animate-scale-in"
                />
              ) : (
                <span className="text-[10px] text-naipe-600">Yo</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
