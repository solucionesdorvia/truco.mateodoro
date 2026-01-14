'use client'

import { cn } from '@/lib/utils'

interface AnnouncementBannerProps {
  type: 'truco' | 'envido' | 'flor' | 'win' | 'lose'
  message: string
  subMessage?: string
  show: boolean
}

export function AnnouncementBanner({ type, message, subMessage, show }: AnnouncementBannerProps) {
  if (!show) return null
  
  const typeStyles = {
    truco: {
      bg: 'from-amber-500/95 via-amber-600/95 to-amber-700/95',
      border: 'border-amber-400/50',
      text: 'text-white',
      shadow: 'shadow-[0_0_60px_rgba(245,158,11,0.5)]',
      glow: 'bg-amber-400',
    },
    envido: {
      bg: 'from-cyan-500/95 via-cyan-600/95 to-cyan-700/95',
      border: 'border-cyan-400/50',
      text: 'text-white',
      shadow: 'shadow-[0_0_60px_rgba(6,182,212,0.5)]',
      glow: 'bg-cyan-400',
    },
    flor: {
      bg: 'from-pink-500/95 via-rose-500/95 to-pink-600/95',
      border: 'border-pink-400/50',
      text: 'text-white',
      shadow: 'shadow-[0_0_60px_rgba(236,72,153,0.5)]',
      glow: 'bg-pink-400',
    },
    win: {
      bg: 'from-emerald-500/95 via-emerald-600/95 to-emerald-700/95',
      border: 'border-emerald-400/50',
      text: 'text-white',
      shadow: 'shadow-[0_0_60px_rgba(16,185,129,0.5)]',
      glow: 'bg-emerald-400',
    },
    lose: {
      bg: 'from-gray-600/95 via-gray-700/95 to-gray-800/95',
      border: 'border-gray-500/50',
      text: 'text-gray-200',
      shadow: 'shadow-[0_0_40px_rgba(107,114,128,0.3)]',
      glow: 'bg-gray-400',
    },
  }
  
  const styles = typeStyles[type]
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop oscuro */}
      <div className="absolute inset-0 bg-black/30 animate-in fade-in duration-200" />
      
      {/* Banner */}
      <div 
        className={cn(
          "relative px-12 py-6 sm:px-20 sm:py-8",
          "bg-gradient-to-r rounded-2xl",
          "border-2 backdrop-blur-sm",
          "animate-in zoom-in-95 fade-in duration-300",
          styles.bg,
          styles.border,
          styles.shadow
        )}
      >
        {/* Líneas decorativas */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-px bg-white/30" />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-px bg-white/30" />
        
        {/* Glow detrás */}
        <div className={cn(
          "absolute inset-0 -z-10 blur-2xl opacity-50 rounded-2xl",
          styles.glow
        )} />
        
        {/* Contenido */}
        <div className="text-center">
          <h2 className={cn(
            "text-3xl sm:text-5xl font-black uppercase tracking-wider",
            styles.text
          )}>
            {message}
          </h2>
          {subMessage && (
            <p className={cn(
              "mt-2 text-lg sm:text-xl opacity-90",
              styles.text
            )}>
              {subMessage}
            </p>
          )}
        </div>
        
        {/* Destellos animados */}
        <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-white/80 animate-ping" />
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white/80 animate-ping delay-150" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-white/80 animate-ping delay-300" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-white/80 animate-ping delay-500" />
      </div>
    </div>
  )
}

// Componente para mostrar el nivel de truco actual (cuando está aceptado)
export function TrucoLevelBadge({ level }: { level: number }) {
  if (level === 0) return null
  
  const labels = ['', 'TRUCO', 'RETRUCO', 'VALE 4']
  const colors = [
    '',
    'from-amber-500 to-amber-600 border-amber-400/50',
    'from-orange-500 to-orange-600 border-orange-400/50',
    'from-red-500 to-red-600 border-red-400/50',
  ]
  
  return (
    <div 
      className={cn(
        "fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-20",
        "px-6 py-2 rounded-full",
        "bg-gradient-to-r border-2 backdrop-blur-sm",
        "shadow-lg",
        colors[level]
      )}
    >
      <span className="text-white font-black text-sm sm:text-base uppercase tracking-wider">
        {labels[level]}
      </span>
    </div>
  )
}

