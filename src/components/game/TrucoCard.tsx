'use client'

import { cn } from '@/lib/utils'

interface TrucoCardProps {
  number: number
  suit: 'espada' | 'basto' | 'oro' | 'copa'
  isHidden?: boolean
  isSelected?: boolean
  isPlayable?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg' | 'hand' | 'played'
  className?: string
}

const suitColors: Record<string, { primary: string; secondary: string }> = {
  espada: { primary: '#1e40af', secondary: '#3b82f6' },
  basto: { primary: '#166534', secondary: '#22c55e' },
  oro: { primary: '#b45309', secondary: '#fbbf24' },
  copa: { primary: '#991b1b', secondary: '#ef4444' },
}

const suitIcons: Record<string, React.ReactNode> = {
  espada: (
    <svg viewBox="0 0 40 60" fill="currentColor" className="w-full h-full">
      {/* Hoja de espada */}
      <path d="M20 5 L24 15 L22 15 L22 45 L26 48 L26 52 L20 55 L14 52 L14 48 L18 45 L18 15 L16 15 Z" />
      {/* Guardia */}
      <ellipse cx="20" cy="15" rx="8" ry="2" opacity="0.6" />
      {/* Pomo */}
      <circle cx="20" cy="8" r="2.5" />
    </svg>
  ),
  basto: (
    <svg viewBox="0 0 40 60" fill="currentColor" className="w-full h-full">
      {/* Palo principal */}
      <path d="M18 10 C18 10 16 15 16 20 C16 25 14 30 14 35 C14 40 16 45 18 50 L22 50 C24 45 26 40 26 35 C26 30 24 25 24 20 C24 15 22 10 22 10 Z" />
      {/* Nudos */}
      <ellipse cx="20" cy="18" rx="5" ry="2" opacity="0.4" />
      <ellipse cx="20" cy="28" rx="5" ry="2" opacity="0.4" />
      <ellipse cx="20" cy="38" rx="5" ry="2" opacity="0.4" />
      {/* Hojas */}
      <path d="M14 12 C10 10 8 14 10 18 C12 16 14 14 14 12" opacity="0.7" />
      <path d="M26 12 C30 10 32 14 30 18 C28 16 26 14 26 12" opacity="0.7" />
    </svg>
  ),
  oro: (
    <svg viewBox="0 0 40 60" fill="currentColor" className="w-full h-full">
      {/* Moneda principal */}
      <circle cx="20" cy="30" r="18" />
      {/* Brillo interior */}
      <circle cx="20" cy="30" r="14" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="20" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      {/* Sol central */}
      <circle cx="20" cy="30" r="5" opacity="0.5" />
      {/* Rayos */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <line
          key={i}
          x1={20 + Math.cos(angle * Math.PI / 180) * 6}
          y1={30 + Math.sin(angle * Math.PI / 180) * 6}
          x2={20 + Math.cos(angle * Math.PI / 180) * 10}
          y2={30 + Math.sin(angle * Math.PI / 180) * 10}
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.4"
        />
      ))}
    </svg>
  ),
  copa: (
    <svg viewBox="0 0 40 60" fill="currentColor" className="w-full h-full">
      {/* Copa */}
      <path d="M10 10 L12 30 C12 35 15 38 20 38 C25 38 28 35 28 30 L30 10 Z" />
      {/* Brillo */}
      <path d="M14 12 L15 28 C15 32 17 34 20 34 C17 34 14 30 14 26 Z" opacity="0.3" fill="white" />
      {/* Tallo */}
      <rect x="18" y="38" width="4" height="10" />
      {/* Base */}
      <ellipse cx="20" cy="52" rx="10" ry="3" />
      <ellipse cx="20" cy="50" rx="8" ry="2" opacity="0.5" />
    </svg>
  ),
}

const sizeClasses = {
  sm: 'w-10 h-14 sm:w-12 sm:h-[68px]',
  md: 'w-16 h-[88px] sm:w-20 sm:h-28',
  lg: 'w-24 h-[132px] sm:w-28 sm:h-[154px]',
  hand: 'w-20 h-28 sm:w-28 sm:h-[154px]',
  played: 'w-14 h-20 sm:w-20 sm:h-28',
}

const numberDisplay = (num: number) => {
  if (num === 10) return 'S'
  if (num === 11) return 'C'
  if (num === 12) return 'R'
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
}: TrucoCardProps) {
  const colors = suitColors[suit]
  
  if (isHidden) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-lg sm:rounded-xl overflow-hidden',
          'shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
          'transition-all duration-200',
          className
        )}
        style={{
          background: `
            linear-gradient(135deg, 
              #1e1b4b 0%, 
              #312e81 25%, 
              #1e1b4b 50%, 
              #312e81 75%, 
              #1e1b4b 100%
            )
          `,
        }}
      >
        {/* Patrón del reverso */}
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 4px,
                rgba(99, 102, 241, 0.1) 4px,
                rgba(99, 102, 241, 0.1) 8px
              )
            `,
          }}
        >
          <div className="w-3/4 h-3/4 rounded border border-indigo-500/30 flex items-center justify-center bg-indigo-950/50">
            <span className="text-indigo-400/50 text-lg sm:text-2xl">🎴</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={cn(
        sizeClasses[size],
        'rounded-lg sm:rounded-xl overflow-hidden relative',
        'transition-all duration-200 transform',
        'shadow-[0_4px_20px_rgba(0,0,0,0.3)]',
        isPlayable && onClick && 'cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]',
        isSelected && 'shadow-[0_0_30px_rgba(251,191,36,0.6)]',
        !isPlayable && 'opacity-70',
        className
      )}
    >
      {/* Fondo de la carta - textura de papel viejo */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(145deg, 
              #fef9e7 0%, 
              #f5f0dc 20%,
              #ebe5d0 50%,
              #f5f0dc 80%,
              #fef9e7 100%
            )
          `,
        }}
      />
      
      {/* Textura sutil de papel */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Borde interno decorativo */}
      <div 
        className="absolute inset-1 sm:inset-1.5 rounded-md sm:rounded-lg border opacity-30"
        style={{ borderColor: colors.primary }}
      />

      {/* Número esquina superior izquierda */}
      <div 
        className="absolute top-1 left-1.5 sm:top-1.5 sm:left-2 flex flex-col items-center"
        style={{ color: colors.primary }}
      >
        <span className={cn(
          'font-black leading-none',
          size === 'sm' || size === 'played' ? 'text-xs sm:text-sm' : 
          size === 'md' ? 'text-base sm:text-lg' : 
          'text-xl sm:text-2xl'
        )}>
          {numberDisplay(number)}
        </span>
        <div className={cn(
          size === 'sm' || size === 'played' ? 'w-2.5 h-3 sm:w-3 sm:h-4' : 
          size === 'md' ? 'w-4 h-5 sm:w-5 sm:h-6' : 
          'w-5 h-6 sm:w-6 sm:h-8'
        )}>
          {suitIcons[suit]}
        </div>
      </div>

      {/* Palo central grande */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ color: colors.primary }}
      >
        <div 
          className={cn(
            size === 'sm' || size === 'played' ? 'w-6 h-9 sm:w-8 sm:h-12' : 
            size === 'md' ? 'w-10 h-14 sm:w-14 sm:h-20' : 
            'w-14 h-20 sm:w-20 sm:h-28'
          )}
          style={{
            filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.15))',
          }}
        >
          {suitIcons[suit]}
        </div>
      </div>

      {/* Número esquina inferior derecha (rotado) */}
      <div 
        className="absolute bottom-1 right-1.5 sm:bottom-1.5 sm:right-2 flex flex-col items-center rotate-180"
        style={{ color: colors.primary }}
      >
        <span className={cn(
          'font-black leading-none',
          size === 'sm' || size === 'played' ? 'text-xs sm:text-sm' : 
          size === 'md' ? 'text-base sm:text-lg' : 
          'text-xl sm:text-2xl'
        )}>
          {numberDisplay(number)}
        </span>
        <div className={cn(
          size === 'sm' || size === 'played' ? 'w-2.5 h-3 sm:w-3 sm:h-4' : 
          size === 'md' ? 'w-4 h-5 sm:w-5 sm:h-6' : 
          'w-5 h-6 sm:w-6 sm:h-8'
        )}>
          {suitIcons[suit]}
        </div>
      </div>

      {/* Efecto de brillo */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/5 pointer-events-none" />
      
      {/* Sombra interior sutil */}
      <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] pointer-events-none rounded-lg sm:rounded-xl" />
    </div>
  )
}

// Mini card para display en listas
export function MiniCard({ number, suit }: { number: number; suit: 'espada' | 'basto' | 'oro' | 'copa' }) {
  const colors = suitColors[suit]
  return (
    <span 
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-sm font-bold"
      style={{ 
        backgroundColor: `${colors.primary}15`,
        color: colors.primary,
      }}
    >
      {numberDisplay(number)}
      <span className="w-3 h-4">{suitIcons[suit]}</span>
    </span>
  )
}
