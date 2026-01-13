'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { 
  Plus, 
  Zap, 
  History,
  Hash,
  Copy,
  Check,
  ArrowRight,
  Coins,
  Timer,
  Users,
  Target,
  Flame,
  Sparkles
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

type GameMode = 'ONE_VS_ONE' | 'TWO_VS_TWO' | 'THREE_VS_THREE'
type StakeMode = 'NONE' | 'ENTRY_FEE' | 'TEAM_POOL'

interface CreateGameConfig {
  mode: GameMode
  targetScore: 15 | 30
  florEnabled: boolean
  chatEnabled: boolean
  timerEnabled: boolean
  timerSeconds: number
  stakeMode: StakeMode
  entryFeeCredits: number
  stakeTotalCredits: number
}

interface CreatedRoom {
  id: string
  codeTeamA: string
  codeTeamB: string
}

// SVG Icons
function EspadaSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={className} fill="currentColor">
      <path d="M12 0C12 0 8 6 8 10C8 13 9.5 15 12 15.5C14.5 15 16 13 16 10C16 6 12 0 12 0Z" />
      <path d="M12 15V30" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <path d="M9 26H15" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function BastoSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={className} fill="currentColor">
      <ellipse cx="12" cy="4" rx="4" ry="3.5"/>
      <path d="M10 6C10 6 9 10 9 14C9 18 10 22 10 26" strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <path d="M14 6C14 6 15 10 15 14C15 18 14 22 14 26" strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <path d="M8 26H16" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function CopaSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 28" className={className} fill="currentColor">
      <path d="M6 0H18V2C18 8 15 12 12 14C9 12 6 8 6 2V0Z" />
      <path d="M12 14V22" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <path d="M8 22H16V24H8V22Z" />
    </svg>
  )
}

export default function JugarPage() {
  const router = useRouter()
  const { data: session } = useSession()
  
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [createdRoom, setCreatedRoom] = useState<CreatedRoom | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  
  const [config, setConfig] = useState<CreateGameConfig>({
    mode: 'TWO_VS_TWO',
    targetScore: 15,
    florEnabled: false,
    chatEnabled: true,
    timerEnabled: false,
    timerSeconds: 25,
    stakeMode: 'NONE',
    entryFeeCredits: 10,
    stakeTotalCredits: 100,
  })

  const handleCreateGame = async () => {
    setIsCreating(true)
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la partida')
      }
      
      setCreatedRoom({
        id: data.room.id,
        codeTeamA: data.room.codeTeamA,
        codeTeamB: data.room.codeTeamB,
      })
      
      toast.success('¡Mesa armada!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear mesa')
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinGame = async () => {
    if (!joinCode.trim()) {
      toast.error('Ingresá un código')
      return
    }
    
    setIsJoining(true)
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.toUpperCase() }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al unirse')
      }
      
      toast.success('¡Entraste a la mesa!')
      router.push(`/lobby/${data.room.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al unirse')
    } finally {
      setIsJoining(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Código copiado')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getModeLabel = (mode: GameMode) => {
    switch (mode) {
      case 'ONE_VS_ONE': return '1v1'
      case 'TWO_VS_TWO': return '2v2'
      case 'THREE_VS_THREE': return '3v3'
    }
  }

  const getModeDesc = (mode: GameMode) => {
    switch (mode) {
      case 'ONE_VS_ONE': return 'Mano a mano'
      case 'TWO_VS_TWO': return 'Duplas'
      case 'THREE_VS_THREE': return 'Equipos'
    }
  }

  const getPlayersCount = (mode: GameMode) => {
    switch (mode) {
      case 'ONE_VS_ONE': return 2
      case 'TWO_VS_TWO': return 4
      case 'THREE_VS_THREE': return 6
    }
  }

  const resetCreateDialog = () => {
    setCreatedRoom(null)
    setStep(1)
    setConfig({
      mode: 'TWO_VS_TWO',
      targetScore: 15,
      florEnabled: false,
      chatEnabled: true,
      timerEnabled: false,
      timerSeconds: 25,
      stakeMode: 'NONE',
      entryFeeCredits: 10,
      stakeTotalCredits: 100,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="bg-paño/20 text-paño-50 border-paño/30 mb-4">
          <Target className="w-3 h-3 mr-1" />
          Centro de juego
        </Badge>
        <h1 className="text-3xl lg:text-5xl font-bold text-naipe mb-4 tracking-tight">
          ARMÁ TU MESA
        </h1>
        <p className="text-naipe-600 max-w-xl mx-auto">
          Creá una partida o unite con código. 
          <span className="text-naipe-400"> Elegí modo, reglas y fichas.</span>
        </p>
      </div>

      {/* Main Actions Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Quick Match - Coming Soon */}
        <div className="card-club p-6 text-center opacity-60 cursor-not-allowed relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <Badge className="bg-noche-200 text-naipe-700 border-paño/20 text-[10px]">
              Próximamente
            </Badge>
          </div>
          <div className="w-16 h-16 mx-auto rounded-club bg-celeste/10 border border-celeste/30 flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-celeste/50" />
          </div>
          <h3 className="text-lg font-semibold text-naipe-400 mb-2">Quick Match</h3>
          <p className="text-sm text-naipe-700">Encontrar rival automático</p>
        </div>

        {/* Create Game */}
        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          setCreateDialogOpen(open)
          if (!open) resetCreateDialog()
        }}>
          <DialogTrigger asChild>
            <div className="card-club p-6 text-center cursor-pointer group hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 mx-auto rounded-club bg-paño/20 border border-paño/40 flex items-center justify-center mb-4 group-hover:bg-paño/30 group-hover:border-paño/60 transition-all">
                <Plus className="w-8 h-8 text-paño-50 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-lg font-semibold text-naipe mb-2">Armar mesa</h3>
              <p className="text-sm text-naipe-700">Configurá tu propia partida</p>
            </div>
          </DialogTrigger>
          
          <DialogContent className="bg-noche-100 border-paño/20 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-naipe flex items-center gap-2">
                <EspadaSVG className="w-5 h-6 text-paño" />
                {createdRoom ? 'Mesa lista' : step === 1 ? 'Paso 1: Reglas' : 'Paso 2: Fichas'}
              </DialogTitle>
              <DialogDescription className="text-naipe-600">
                {createdRoom 
                  ? 'Compartí los códigos con tu equipo' 
                  : step === 1 
                    ? 'Elegí modo, puntos y opciones'
                    : 'Definí si se juega con fichas'}
              </DialogDescription>
            </DialogHeader>

            {createdRoom ? (
              /* Success State */
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-paño/20 border border-paño/40 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-paño-50" />
                  </div>
                  <h3 className="text-xl font-bold text-naipe mb-1">¡Mesa armada!</h3>
                  <p className="text-naipe-600 text-sm">Pasales los códigos a tus compañeros</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-club bg-equipoA-bg border border-equipoA-border text-center">
                    <p className="text-xs text-equipoA mb-2 font-semibold">EQUIPO A</p>
                    <p className="text-2xl font-mono font-bold text-naipe tracking-wider mb-3">{createdRoom.codeTeamA}</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-equipoA hover:bg-equipoA/20"
                      onClick={() => copyCode(createdRoom.codeTeamA)}
                    >
                      {copiedCode === createdRoom.codeTeamA ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="ml-1 text-xs">Copiar</span>
                    </Button>
                  </div>
                  <div className="p-4 rounded-club bg-equipoB-bg border border-equipoB-border text-center">
                    <p className="text-xs text-equipoB mb-2 font-semibold">EQUIPO B</p>
                    <p className="text-2xl font-mono font-bold text-naipe tracking-wider mb-3">{createdRoom.codeTeamB}</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-equipoB hover:bg-equipoB/20"
                      onClick={() => copyCode(createdRoom.codeTeamB)}
                    >
                      {copiedCode === createdRoom.codeTeamB ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="ml-1 text-xs">Copiar</span>
                    </Button>
                  </div>
                </div>
                
                <Button 
                  className="w-full btn-pano"
                  onClick={() => router.push(`/lobby/${createdRoom.id}`)}
                >
                  Ir al lobby
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : step === 1 ? (
              /* Step 1: Mode & Rules */
              <div className="space-y-6 py-4">
                {/* Mode Selection */}
                <div className="space-y-3">
                  <Label className="text-naipe-300 text-sm">Modo de juego</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['ONE_VS_ONE', 'TWO_VS_TWO', 'THREE_VS_THREE'] as GameMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={`p-4 rounded-club border-2 transition-all duration-200 ${
                          config.mode === mode 
                            ? 'bg-paño/20 border-paño text-naipe' 
                            : 'bg-noche-200 border-paño/20 text-naipe-600 hover:border-paño/40'
                        }`}
                        onClick={() => setConfig({ ...config, mode })}
                      >
                        <div className="text-2xl font-bold">{getModeLabel(mode)}</div>
                        <div className="text-xs mt-1 opacity-70">{getModeDesc(mode)}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-naipe-700 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {getPlayersCount(config.mode)} jugadores
                  </p>
                </div>

                {/* Target Score */}
                <div className="space-y-3">
                  <Label className="text-naipe-300 text-sm">Puntos para ganar</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`p-3 rounded-club border-2 transition-all ${
                        config.targetScore === 15 
                          ? 'bg-paño/20 border-paño text-naipe' 
                          : 'bg-noche-200 border-paño/20 text-naipe-600 hover:border-paño/40'
                      }`}
                      onClick={() => setConfig({ ...config, targetScore: 15 })}
                    >
                      <span className="text-xl font-bold">15</span>
                      <span className="text-xs ml-1 opacity-70">puntos</span>
                    </button>
                    <button
                      type="button"
                      className={`p-3 rounded-club border-2 transition-all ${
                        config.targetScore === 30 
                          ? 'bg-paño/20 border-paño text-naipe' 
                          : 'bg-noche-200 border-paño/20 text-naipe-600 hover:border-paño/40'
                      }`}
                      onClick={() => setConfig({ ...config, targetScore: 30 })}
                    >
                      <span className="text-xl font-bold">30</span>
                      <span className="text-xs ml-1 opacity-70">puntos</span>
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4 pt-4 border-t border-paño/20">
                  <div className="flex items-center justify-between p-3 rounded-club bg-noche-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-club bg-oro/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-oro" />
                      </div>
                      <div>
                        <Label className="text-naipe-300 text-sm">Flor</Label>
                        <p className="text-xs text-naipe-700">3 del mismo palo</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.florEnabled}
                      onCheckedChange={(checked) => setConfig({ ...config, florEnabled: checked })}
                      className="data-[state=checked]:bg-paño"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-club bg-noche-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-club bg-celeste/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-celeste" />
                      </div>
                      <div>
                        <Label className="text-naipe-300 text-sm">Chat</Label>
                        <p className="text-xs text-naipe-700">Mensajes en partida</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.chatEnabled}
                      onCheckedChange={(checked) => setConfig({ ...config, chatEnabled: checked })}
                      className="data-[state=checked]:bg-paño"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-club bg-noche-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-club bg-destructive/10 flex items-center justify-center">
                        <Timer className="w-4 h-4 text-destructive" />
                      </div>
                      <div>
                        <Label className="text-naipe-300 text-sm">Timer</Label>
                        <p className="text-xs text-naipe-700">Tiempo límite por turno</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.timerEnabled}
                      onCheckedChange={(checked) => setConfig({ ...config, timerEnabled: checked })}
                      className="data-[state=checked]:bg-paño"
                    />
                  </div>
                  
                  {config.timerEnabled && (
                    <div className="ml-11 p-3 rounded-club bg-noche-300 border-l-2 border-destructive/30">
                      <Label className="text-naipe-400 text-xs">Segundos por turno</Label>
                      <Select
                        value={config.timerSeconds.toString()}
                        onValueChange={(v) => setConfig({ ...config, timerSeconds: parseInt(v) })}
                      >
                        <SelectTrigger className="bg-noche-200 border-paño/20 mt-1 text-naipe">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-noche-200 border-paño/20">
                          <SelectItem value="15">15 segundos</SelectItem>
                          <SelectItem value="25">25 segundos</SelectItem>
                          <SelectItem value="45">45 segundos</SelectItem>
                          <SelectItem value="60">60 segundos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full btn-pano"
                  onClick={() => setStep(2)}
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              /* Step 2: Stake */
              <div className="space-y-6 py-4">
                {/* Stake Mode */}
                <div className="space-y-3">
                  <Label className="text-naipe-300 text-sm">¿Se juega con fichas?</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'NONE', label: 'Gratis', desc: 'Sin fichas, por diversión', icon: '🎮' },
                      { value: 'ENTRY_FEE', label: 'Entrada fija', desc: 'Cada jugador paga igual', icon: '🎟️' },
                      { value: 'TEAM_POOL', label: 'Pozo por equipo', desc: 'Cada equipo arma su pozo', icon: '💰' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`w-full p-4 rounded-club border-2 text-left transition-all ${
                          config.stakeMode === option.value 
                            ? 'bg-paño/20 border-paño' 
                            : 'bg-noche-200 border-paño/20 hover:border-paño/40'
                        }`}
                        onClick={() => setConfig({ ...config, stakeMode: option.value as StakeMode })}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{option.icon}</span>
                          <div>
                            <div className="font-semibold text-naipe">{option.label}</div>
                            <div className="text-xs text-naipe-700">{option.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {config.stakeMode === 'ENTRY_FEE' && (
                  <div className="p-4 rounded-club bg-oro/10 border border-oro/30 space-y-3">
                    <Label className="text-oro text-sm flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      Fichas de entrada por jugador
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={config.entryFeeCredits}
                      onChange={(e) => setConfig({ ...config, entryFeeCredits: parseInt(e.target.value) || 0 })}
                      className="bg-noche-200 border-oro/30 text-naipe text-xl font-bold text-center"
                    />
                    <p className="text-xs text-oro/80">
                      Pozo total: {config.entryFeeCredits * getPlayersCount(config.mode)} fichas
                    </p>
                  </div>
                )}
                
                {config.stakeMode === 'TEAM_POOL' && (
                  <div className="p-4 rounded-club bg-oro/10 border border-oro/30 space-y-3">
                    <Label className="text-oro text-sm flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      Total del pozo por equipo
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={config.stakeTotalCredits}
                      onChange={(e) => setConfig({ ...config, stakeTotalCredits: parseInt(e.target.value) || 0 })}
                      className="bg-noche-200 border-oro/30 text-naipe text-xl font-bold text-center"
                    />
                    <p className="text-xs text-oro/80">
                      Cada equipo debe juntar {config.stakeTotalCredits} fichas entre todos. 
                      Pozo total: {config.stakeTotalCredits * 2} fichas.
                    </p>
                  </div>
                )}

                {/* Balance preview */}
                {session?.user && config.stakeMode !== 'NONE' && (
                  <div className="flex items-center gap-2 p-3 rounded-club bg-noche-200 border border-paño/20">
                    <div className="chip">{session.user.creditsBalance ?? 0}</div>
                    <span className="text-sm text-naipe-600">Tu saldo actual</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    className="flex-1 border-paño/30 text-naipe-400 hover:bg-noche-200"
                    onClick={() => setStep(1)}
                  >
                    Atrás
                  </Button>
                  <Button 
                    className="flex-1 btn-pano"
                    onClick={handleCreateGame}
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creando...' : 'Armar mesa'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Join Game */}
        <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
          <DialogTrigger asChild>
            <div className="card-club p-6 text-center cursor-pointer group hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 mx-auto rounded-club bg-oro/10 border border-oro/30 flex items-center justify-center mb-4 group-hover:bg-oro/20 group-hover:border-oro/50 transition-all">
                <Hash className="w-8 h-8 text-oro group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-lg font-semibold text-naipe mb-2">Unirse</h3>
              <p className="text-sm text-naipe-700">Entrar con código</p>
            </div>
          </DialogTrigger>
          
          <DialogContent className="bg-noche-100 border-paño/20">
            <DialogHeader>
              <DialogTitle className="text-naipe flex items-center gap-2">
                <Hash className="w-5 h-5 text-oro" />
                Unirse a mesa
              </DialogTitle>
              <DialogDescription className="text-naipe-600">
                Ingresá el código que te pasaron
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-naipe-300 text-sm">Código de partida</Label>
                <Input
                  placeholder="ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="bg-noche-200 border-paño/30 text-center text-3xl font-mono font-bold tracking-[0.3em] uppercase text-naipe h-16"
                  maxLength={6}
                />
              </div>
              
              <Button 
                className="w-full btn-oro"
                onClick={handleJoinGame}
                disabled={isJoining || !joinCode.trim()}
              >
                {isJoining ? 'Entrando...' : 'Entrar'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* My Games */}
        <Link href="/mis-partidas" className="block">
          <div className="card-club p-6 text-center cursor-pointer group hover:-translate-y-1 transition-all duration-300 h-full">
            <div className="w-16 h-16 mx-auto rounded-club bg-celeste/10 border border-celeste/30 flex items-center justify-center mb-4 group-hover:bg-celeste/20 group-hover:border-celeste/50 transition-all">
              <History className="w-8 h-8 text-celeste group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg font-semibold text-naipe mb-2">Mis partidas</h3>
            <p className="text-sm text-naipe-700">Historial y estadísticas</p>
          </div>
        </Link>
      </div>

      {/* Info Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* How to Play */}
        <Card className="card-club lg:col-span-2 border-0">
          <CardHeader className="border-b border-paño/20">
            <CardTitle className="text-naipe flex items-center gap-2">
              <Target className="w-5 h-5 text-paño" />
              Cómo funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-paño/20 border border-paño/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-paño-50 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-naipe mb-1">Armá o unite</h4>
                <p className="text-sm text-naipe-700">Creá una mesa o entrá con código de equipo</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-paño/20 border border-paño/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-paño-50 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-naipe mb-1">Esperá en el lobby</h4>
                <p className="text-sm text-naipe-700">Cuando estén todos, el creador inicia</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-paño/20 border border-paño/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-paño-50 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-naipe mb-1">¡A jugar!</h4>
                <p className="text-sm text-naipe-700">En tiempo real hasta que un equipo gane</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stake Info */}
        <Card className="card-club border-0">
          <CardHeader className="border-b border-paño/20">
            <CardTitle className="text-naipe flex items-center gap-2">
              <Coins className="w-5 h-5 text-oro" />
              Modos de fichas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-3 rounded-club bg-noche-200">
              <div className="flex items-center gap-2 mb-1">
                <span>🎮</span>
                <span className="font-semibold text-naipe text-sm">Gratis</span>
              </div>
              <p className="text-xs text-naipe-700">Sin fichas. Por diversión.</p>
            </div>
            <div className="p-3 rounded-club bg-noche-200">
              <div className="flex items-center gap-2 mb-1">
                <span>🎟️</span>
                <span className="font-semibold text-naipe text-sm">Entrada fija</span>
              </div>
              <p className="text-xs text-naipe-700">Cada jugador paga igual. El pozo va al ganador.</p>
            </div>
            <div className="p-3 rounded-club bg-oro/10 border border-oro/20">
              <div className="flex items-center gap-2 mb-1">
                <span>💰</span>
                <span className="font-semibold text-oro text-sm">Pozo por equipo</span>
                <Badge className="bg-oro/20 text-oro text-[10px] border-none">Popular</Badge>
              </div>
              <p className="text-xs text-naipe-700">Cada equipo junta su pozo. Reparto proporcional o a uno.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
