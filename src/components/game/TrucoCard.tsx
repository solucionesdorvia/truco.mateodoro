'use client'

import { cn } from '@/lib/utils'

interface TrucoCardProps {
  number: number
  suit: 'espada' | 'basto' | 'oro' | 'copa'
  isHidden?: boolean
  isSelected?: boolean
  isPlayable?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  useImage?: boolean
}

const suitColors: Record<string, string> = {
  espada: 'text-blue-600',
  basto: 'text-green-700',
  oro: 'text-amber-500',
  copa: 'text-red-600',
}

const suitSymbols: Record<string, string> = {
  espada: '⚔️',
  basto: '🪵',
  oro: '🪙',
  copa: '🏆',
}

const suitSvg: Record<string, React.ReactNode> = {
  espada: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2L14 8H10L12 2ZM12 8L15 20L12 18L9 20L12 8ZM11 10V16L10 17L11 16V10ZM13 10V16L14 17L13 16V10Z" />
    </svg>
  ),
  basto: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2C10 2 8 4 8 6C8 8 10 10 10 12C10 14 8 16 8 18C8 20 10 22 12 22C14 22 16 20 16 18C16 16 14 14 14 12C14 10 16 8 16 6C16 4 14 2 12 2ZM12 4C13 4 14 5 14 6C14 7 13 8 12 10C11 8 10 7 10 6C10 5 11 4 12 4Z" />
    </svg>
  ),
  oro: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
    </svg>
  ),
  copa: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M5 3H19V5C19 9 16 12 12 12C8 12 5 9 5 5V3ZM7 5V5C7 8 9 10 12 10C15 10 17 8 17 5V5H7ZM10 14H14V18H16V20H8V18H10V14ZM11 12C11 12 10 13 10 14H14C14 13 13 12 13 12H11Z" />
    </svg>
  ),
}

const sizeClasses = {
  sm: 'w-12 h-18',
  md: 'w-20 h-28',
  lg: 'w-28 h-40',
}

const numberDisplay = (num: number) => {
  if (num === 10) return 'S' // Sota
  if (num === 11) return 'C' // Caballo
  if (num === 12) return 'R' // Rey
  return num.toString()
}

export function TrucoCard({
  number,
  suit,
  isHidden = false,
  isSelected = false,
  isPlayable = true,
  onClick,
  size = 'md',
  className,
  useImage = true,
}: TrucoCardProps) {
  if (isHidden) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-xl bg-gradient-to-br from-indigo-800 via-purple-900 to-indigo-950 border-2 border-indigo-600',
          'shadow-lg flex items-center justify-center',
          'transition-all duration-200',
          className
        )}
      >
        <div className="w-3/4 h-3/4 rounded-lg border-2 border-indigo-500/50 flex items-center justify-center">
          <div className="text-indigo-400 text-2xl font-bold opacity-50">🎴</div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={cn(
        sizeClasses[size],
        'rounded-xl bg-gradient-to-br from-stone-50 to-stone-100 border-2',
        'shadow-lg relative overflow-hidden',
        'transition-all duration-200 transform',
        isPlayable && onClick && 'cursor-pointer hover:scale-105 hover:-translate-y-2 hover:shadow-xl',
        isSelected && 'ring-4 ring-amber-400 -translate-y-4 scale-105',
        !isPlayable && 'opacity-60',
        'border-stone-300',
        className
      )}
    >
      {useImage && number > 0 && (
        <img
          src={`/cards/${suit}/${number}-${suit}.jpg`}
          alt={`${number} ${suit}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {useImage && (
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
      )}
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-stone-400 to-transparent" />
      </div>

      {/* Top left number and suit */}
      <div className={cn('absolute top-1 left-1.5 flex flex-col items-center', suitColors[suit], useImage && 'text-black')}>
        <span className={cn(
          'font-bold leading-none',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-lg' : 'text-2xl'
        )}>
          {numberDisplay(number)}
        </span>
        <div className={cn(
          size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'
        )}>
          {suitSvg[suit]}
        </div>
      </div>

      {/* Center suit - large */}
      <div className={cn(
        'absolute inset-0 flex items-center justify-center',
        suitColors[suit],
        useImage && 'text-black/70'
      )}>
        <div className={cn(
          size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16'
        )}>
          {suitSvg[suit]}
        </div>
      </div>

      {/* Bottom right number and suit (inverted) */}
      <div className={cn('absolute bottom-1 right-1.5 flex flex-col items-center rotate-180', suitColors[suit], useImage && 'text-black')}>
        <span className={cn(
          'font-bold leading-none',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-lg' : 'text-2xl'
        )}>
          {numberDisplay(number)}
        </span>
        <div className={cn(
          size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'
        )}>
          {suitSvg[suit]}
        </div>
      </div>

      {/* Card shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}

// Mini card for display in lists
export function MiniCard({ number, suit }: { number: number; suit: 'espada' | 'basto' | 'oro' | 'copa' }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-stone-100 text-sm font-medium', suitColors[suit])}>
      {numberDisplay(number)}
      <span className="text-xs">{suitSymbols[suit]}</span>
    </span>
  )
}

