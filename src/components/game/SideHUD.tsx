'use client'

import { 
  X, 
  Settings, 
  Sun,
  Eye,
  MessageCircle,
  Volume2,
  VolumeX
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SideHUDProps {
  scoreA: number
  scoreB: number
  targetScore: number
  myTeam: 'A' | 'B'
  currentBaza: number
  isMuted: boolean
  onMuteToggle: () => void
  onExit: () => void
  onSettings?: () => void
  onChat?: () => void
}

export function SideHUD({
  scoreA,
  scoreB,
  targetScore,
  myTeam,
  currentBaza,
  isMuted,
  onMuteToggle,
  onExit,
  onSettings,
  onChat,
}: SideHUDProps) {
  return (
    <div className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
      {/* Cerrar */}
      <HUDButton 
        onClick={onExit} 
        className="bg-red-900/80 hover:bg-red-800 border-red-700/50"
        tooltip="Salir"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-300" />
      </HUDButton>
      
      {/* Settings */}
      {onSettings && (
        <HUDButton onClick={onSettings} tooltip="Ajustes">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </HUDButton>
      )}
      
      {/* Sonido */}
      <HUDButton onClick={onMuteToggle} tooltip={isMuted ? 'Activar sonido' : 'Silenciar'}>
        {isMuted ? (
          <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
        ) : (
          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </HUDButton>
      
      {/* Separador */}
      <div className="h-px bg-white/10 my-1" />
      
      {/* Marcador */}
      <div className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10">
        <span className="text-[10px] text-white/50 uppercase tracking-wider">A {targetScore}</span>
        
        {/* Score A */}
        <div className={cn(
          "w-10 sm:w-12 py-1.5 rounded-lg text-center transition-all",
          myTeam === 'A' 
            ? "bg-amber-500/20 border-2 border-amber-500/50" 
            : "bg-blue-500/20 border border-blue-500/30"
        )}>
          <span className="text-[10px] text-blue-400 font-medium">TÚ</span>
          <p className={cn(
            "text-xl sm:text-2xl font-black tabular-nums",
            myTeam === 'A' ? "text-amber-400" : "text-blue-400"
          )}>
            {myTeam === 'A' ? scoreA : scoreB}
          </p>
        </div>
        
        {/* Divider */}
        <div className="text-white/30 text-xs">—</div>
        
        {/* Score B */}
        <div className={cn(
          "w-10 sm:w-12 py-1.5 rounded-lg text-center",
          myTeam === 'B' 
            ? "bg-amber-500/20 border-2 border-amber-500/50" 
            : "bg-red-500/20 border border-red-500/30"
        )}>
          <span className="text-[10px] text-red-400 font-medium">RIVAL</span>
          <p className={cn(
            "text-xl sm:text-2xl font-black tabular-nums",
            myTeam === 'B' ? "text-amber-400" : "text-red-400"
          )}>
            {myTeam === 'A' ? scoreB : scoreA}
          </p>
        </div>
      </div>
      
      {/* Separador */}
      <div className="h-px bg-white/10 my-1" />
      
      {/* Estado ronda */}
      <div className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10">
        <Eye className="w-3 h-3 text-white/40" />
        <span className="text-[10px] text-white/60 font-medium">
          {currentBaza === 0 ? '1ra' : currentBaza === 1 ? '2da' : '3ra'}
        </span>
      </div>
      
      {/* Chat */}
      {onChat && (
        <HUDButton onClick={onChat} tooltip="Chat">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        </HUDButton>
      )}
    </div>
  )
}

interface HUDButtonProps {
  onClick: () => void
  children: React.ReactNode
  className?: string
  tooltip?: string
}

function HUDButton({ onClick, children, className, tooltip }: HUDButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={cn(
        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl",
        "bg-black/40 backdrop-blur-sm border border-white/10",
        "flex items-center justify-center",
        "text-white/70 hover:text-white hover:bg-black/60",
        "transition-all duration-200 active:scale-95",
        "hover:border-white/20",
        className
      )}
    >
      {children}
    </button>
  )
}

