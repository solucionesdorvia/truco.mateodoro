'use client'

import { cn } from '@/lib/utils'

interface ResponseDialogProps {
  type: 'truco' | 'envido'
  message: string
  subMessage?: string
  show: boolean
  onAccept: () => void
  onReject: () => void
}

export function ResponseDialog({ 
  type, 
  message, 
  subMessage, 
  show, 
  onAccept, 
  onReject 
}: ResponseDialogProps) {
  if (!show) return null
  
  const typeStyles = {
    truco: {
      bg: 'from-amber-900/95 to-amber-950/95',
      border: 'border-amber-500/50',
      accent: 'text-amber-400',
      acceptBg: 'from-amber-500 to-amber-600',
      acceptHover: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]',
    },
    envido: {
      bg: 'from-cyan-900/95 to-cyan-950/95',
      border: 'border-cyan-500/50',
      accent: 'text-cyan-400',
      acceptBg: 'from-cyan-500 to-cyan-600',
      acceptHover: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]',
    },
  }
  
  const styles = typeStyles[type]
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onReject}
      />
      
      {/* Dialog */}
      <div 
        className={cn(
          "relative w-full max-w-sm p-6 rounded-3xl",
          "bg-gradient-to-b backdrop-blur-lg",
          "border-2",
          "animate-in zoom-in-95 fade-in duration-300",
          "shadow-[0_0_60px_rgba(0,0,0,0.5)]",
          styles.bg,
          styles.border
        )}
      >
        {/* Icono decorativo */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            "bg-gradient-to-b text-3xl",
            type === 'truco' 
              ? "from-amber-500 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.5)]" 
              : "from-cyan-500 to-cyan-600 shadow-[0_0_30px_rgba(6,182,212,0.5)]"
          )}>
            {type === 'truco' ? '⚔️' : '🎯'}
          </div>
        </div>
        
        {/* Contenido */}
        <div className="text-center mt-6 mb-8">
          <h2 className={cn(
            "text-3xl sm:text-4xl font-black uppercase tracking-wider mb-2",
            styles.accent
          )}>
            {message}
          </h2>
          {subMessage && (
            <p className="text-white/70 text-lg">
              {subMessage}
            </p>
          )}
          
          <p className="text-white/50 text-sm mt-4">
            ¿Querés o no querés?
          </p>
        </div>
        
        {/* Botones */}
        <div className="flex gap-4">
          {/* No quiero */}
          <button
            onClick={onReject}
            className={cn(
              "flex-1 py-4 rounded-2xl",
              "bg-gradient-to-b from-gray-700 to-gray-800",
              "border-2 border-gray-600/50",
              "text-white font-bold text-lg uppercase tracking-wide",
              "active:scale-95 transition-all duration-200",
              "hover:shadow-[0_0_20px_rgba(107,114,128,0.3)]"
            )}
          >
            No quiero
          </button>
          
          {/* Quiero */}
          <button
            onClick={onAccept}
            className={cn(
              "flex-1 py-4 rounded-2xl",
              "bg-gradient-to-b",
              "border-2 border-white/20",
              "text-white font-bold text-lg uppercase tracking-wide",
              "active:scale-95 transition-all duration-200",
              styles.acceptBg,
              styles.acceptHover
            )}
          >
            ¡Quiero!
          </button>
        </div>
        
        {/* Efecto de brillo */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
      </div>
    </div>
  )
}

// Dialog de resultado de partida
interface GameResultDialogProps {
  show: boolean
  isWinner: boolean
  scoreA: number
  scoreB: number
  myTeam: 'A' | 'B'
  winnerTeam: 'A' | 'B' | null
  onClose: () => void
}

export function GameResultDialog({
  show,
  isWinner,
  scoreA,
  scoreB,
  myTeam,
  winnerTeam,
  onClose,
}: GameResultDialogProps) {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
      
      {/* Dialog */}
      <div 
        className={cn(
          "relative w-full max-w-sm p-8 rounded-3xl",
          "backdrop-blur-lg border-2",
          "animate-in zoom-in-95 fade-in duration-500",
          isWinner 
            ? "bg-gradient-to-b from-emerald-900/95 to-emerald-950/95 border-emerald-500/50 shadow-[0_0_80px_rgba(16,185,129,0.4)]"
            : "bg-gradient-to-b from-gray-800/95 to-gray-900/95 border-gray-600/50"
        )}
      >
        {/* Confeti/efectos para ganador */}
        {isWinner && (
          <>
            <div className="absolute -top-4 left-1/4 text-4xl animate-bounce delay-100">🎉</div>
            <div className="absolute -top-4 right-1/4 text-4xl animate-bounce delay-300">🎊</div>
          </>
        )}
        
        {/* Contenido */}
        <div className="text-center">
          <div className="text-6xl mb-4">
            {isWinner ? '🏆' : '😔'}
          </div>
          
          <h2 className={cn(
            "text-4xl font-black uppercase tracking-wider mb-2",
            isWinner ? "text-amber-400" : "text-gray-400"
          )}>
            {isWinner ? '¡GANASTE!' : 'Perdiste'}
          </h2>
          
          <p className="text-white/60 mb-6">
            Equipo {winnerTeam} ganó la partida
          </p>
          
          {/* Marcador final */}
          <div className="flex items-center justify-center gap-6 mb-8 px-6 py-4 rounded-2xl bg-black/30">
            <div className="text-center">
              <p className="text-xs text-blue-400 font-medium uppercase mb-1">
                {myTeam === 'A' ? 'TÚ' : 'RIVAL'}
              </p>
              <p className={cn(
                "text-4xl font-black",
                myTeam === 'A' ? "text-blue-400" : "text-red-400"
              )}>
                {scoreA}
              </p>
            </div>
            
            <div className="text-2xl text-white/30">—</div>
            
            <div className="text-center">
              <p className="text-xs text-red-400 font-medium uppercase mb-1">
                {myTeam === 'B' ? 'TÚ' : 'RIVAL'}
              </p>
              <p className={cn(
                "text-4xl font-black",
                myTeam === 'B' ? "text-blue-400" : "text-red-400"
              )}>
                {scoreB}
              </p>
            </div>
          </div>
          
          {/* Botón */}
          <button
            onClick={onClose}
            className={cn(
              "w-full py-4 rounded-2xl",
              "font-bold text-lg uppercase tracking-wide",
              "active:scale-95 transition-all duration-200",
              isWinner 
                ? "bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                : "bg-gradient-to-b from-gray-600 to-gray-700 text-white"
            )}
          >
            Volver a jugar
          </button>
        </div>
      </div>
    </div>
  )
}

