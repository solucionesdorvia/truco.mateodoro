'use client'

import { cn } from '@/lib/utils'
import { Flag } from 'lucide-react'

interface ActionButtonsBarProps {
  // Truco state
  canCallTruco: boolean
  trucoLevel: number
  onCallTruco: () => void
  
  // Envido state
  canCallEnvido: boolean
  onCallEnvido: (call: 'envido' | 'real_envido' | 'falta_envido') => void
  
  // Flor state
  canCallFlor: boolean
  onCallFlor: () => void
  florEnabled: boolean
  
  // Mazo
  onFold: () => void
  
  // General
  waitingForResponse: boolean
}

const TRUCO_LABELS = ['TRUCO', 'RETRUCO', 'VALE 4']

export function ActionButtonsBar({
  canCallTruco,
  trucoLevel,
  onCallTruco,
  canCallEnvido,
  onCallEnvido,
  canCallFlor,
  onCallFlor,
  florEnabled,
  onFold,
  waitingForResponse,
}: ActionButtonsBarProps) {
  const showTruco = canCallTruco && !waitingForResponse
  const showEnvido = canCallEnvido && !waitingForResponse
  const showFlor = canCallFlor && florEnabled && !waitingForResponse
  
  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Botón MAZO (siempre visible pero más pequeño) */}
        <ActionButton
          onClick={onFold}
          variant="danger"
          size="small"
          disabled={waitingForResponse}
        >
          <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm">Mazo</span>
        </ActionButton>
        
        {/* Botón ENVIDO */}
        {showEnvido && (
          <div className="relative group">
            <ActionButton
              onClick={() => onCallEnvido('envido')}
              variant="envido"
              size="large"
            >
              <span className="text-base sm:text-lg font-black">ENVIDO</span>
            </ActionButton>
            
            {/* Sub-opciones de envido (hover/tap) */}
            <div className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
              "flex flex-col gap-1 opacity-0 pointer-events-none",
              "group-hover:opacity-100 group-hover:pointer-events-auto",
              "group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
              "transition-all duration-200"
            )}>
              <SubActionButton onClick={() => onCallEnvido('real_envido')}>
                Real Envido
              </SubActionButton>
              <SubActionButton onClick={() => onCallEnvido('falta_envido')}>
                Falta Envido
              </SubActionButton>
            </div>
          </div>
        )}
        
        {/* Botón TRUCO */}
        {showTruco && (
          <ActionButton
            onClick={onCallTruco}
            variant="truco"
            size="large"
          >
            <span className="text-base sm:text-lg font-black">
              {TRUCO_LABELS[trucoLevel] || 'TRUCO'}
            </span>
          </ActionButton>
        )}
        
        {/* Botón FLOR (chip secundario) */}
        {showFlor && (
          <ActionButton
            onClick={onCallFlor}
            variant="flor"
            size="medium"
          >
            <span className="text-sm font-bold">🌸 FLOR</span>
          </ActionButton>
        )}
      </div>
    </div>
  )
}

interface ActionButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant: 'truco' | 'envido' | 'danger' | 'flor'
  size: 'small' | 'medium' | 'large'
  disabled?: boolean
}

function ActionButton({ onClick, children, variant, size, disabled }: ActionButtonProps) {
  const variantStyles = {
    truco: cn(
      "bg-gradient-to-b from-blue-500 to-blue-700",
      "border-blue-400/50",
      "shadow-[0_8px_32px_rgba(59,130,246,0.5)]",
      "hover:shadow-[0_8px_40px_rgba(59,130,246,0.7)]",
      "text-white"
    ),
    envido: cn(
      "bg-gradient-to-b from-cyan-500 to-cyan-700",
      "border-cyan-400/50",
      "shadow-[0_8px_32px_rgba(6,182,212,0.5)]",
      "hover:shadow-[0_8px_40px_rgba(6,182,212,0.7)]",
      "text-white"
    ),
    danger: cn(
      "bg-gradient-to-b from-red-600 to-red-800",
      "border-red-500/50",
      "shadow-[0_6px_24px_rgba(220,38,38,0.4)]",
      "hover:shadow-[0_6px_32px_rgba(220,38,38,0.6)]",
      "text-white"
    ),
    flor: cn(
      "bg-gradient-to-b from-pink-500 to-rose-600",
      "border-pink-400/50",
      "shadow-[0_6px_24px_rgba(236,72,153,0.5)]",
      "hover:shadow-[0_6px_32px_rgba(236,72,153,0.7)]",
      "text-white"
    ),
  }
  
  const sizeStyles = {
    small: "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex-col gap-0.5",
    medium: "px-5 py-3 sm:px-6 sm:py-4 rounded-2xl",
    large: "w-20 h-20 sm:w-24 sm:h-24 rounded-full",
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center",
        "border-2 backdrop-blur-sm",
        "font-bold uppercase tracking-wide",
        "active:scale-95 transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variantStyles[variant],
        sizeStyles[size]
      )}
    >
      {children}
    </button>
  )
}

interface SubActionButtonProps {
  onClick: () => void
  children: React.ReactNode
}

function SubActionButton({ onClick, children }: SubActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl",
        "bg-cyan-600/90 backdrop-blur-sm",
        "border border-cyan-400/30",
        "text-white text-sm font-bold",
        "hover:bg-cyan-500 active:scale-95",
        "transition-all duration-200",
        "whitespace-nowrap"
      )}
    >
      {children}
    </button>
  )
}

