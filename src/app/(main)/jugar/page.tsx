'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { 
  Plus, 
  Users, 
  Zap, 
  History,
  Gamepad2,
  Hash,
  Copy,
  Check,
  ArrowRight,
  Coins,
  Clock
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      
      toast.success('¡Partida creada!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear partida')
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
      
      toast.success('¡Te uniste a la partida!')
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
      case 'ONE_VS_ONE': return '1 vs 1'
      case 'TWO_VS_TWO': return '2 vs 2'
      case 'THREE_VS_THREE': return '3 vs 3'
    }
  }

  const getPlayersCount = (mode: GameMode) => {
    switch (mode) {
      case 'ONE_VS_ONE': return 2
      case 'TWO_VS_TWO': return 4
      case 'THREE_VS_THREE': return 6
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Centro de Juego
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Creá una partida nueva o unite con un código. 
          Elegí el modo que más te guste y empezá a jugar.
        </p>
      </div>

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Quick Match - Placeholder */}
        <Card className="bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Quick Match</h3>
            <p className="text-sm text-slate-500 mb-4">Encontrar oponentes automáticamente</p>
            <Badge variant="secondary" className="bg-slate-800">Próximamente</Badge>
          </CardContent>
        </Card>

        {/* Create Game */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Card className="bg-slate-900/50 border-slate-800 hover:border-amber-500/30 cursor-pointer transition-all group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-all">
                  <Plus className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Crear Partida</h3>
                <p className="text-sm text-slate-500">Configurá tu propia sala</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Crear Nueva Partida</DialogTitle>
              <DialogDescription className="text-slate-400">
                Configurá las opciones de tu partida
              </DialogDescription>
            </DialogHeader>

            {createdRoom ? (
              /* Success State */
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">¡Partida Creada!</h3>
                  <p className="text-slate-400 text-sm">Compartí los códigos con tu equipo</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                    <p className="text-xs text-blue-400 mb-1">Equipo A</p>
                    <p className="text-2xl font-mono font-bold text-white mb-2">{createdRoom.codeTeamA}</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-blue-400"
                      onClick={() => copyCode(createdRoom.codeTeamA)}
                    >
                      {copiedCode === createdRoom.codeTeamA ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
                    <p className="text-xs text-red-400 mb-1">Equipo B</p>
                    <p className="text-2xl font-mono font-bold text-white mb-2">{createdRoom.codeTeamB}</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-400"
                      onClick={() => copyCode(createdRoom.codeTeamB)}
                    >
                      {copiedCode === createdRoom.codeTeamB ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                  onClick={() => router.push(`/lobby/${createdRoom.id}`)}
                >
                  Ir al Lobby
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              /* Config Form */
              <div className="space-y-6 py-4">
                {/* Mode Selection */}
                <div className="space-y-2">
                  <Label className="text-slate-200">Modo de Juego</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['ONE_VS_ONE', 'TWO_VS_TWO', 'THREE_VS_THREE'] as GameMode[]).map((mode) => (
                      <Button
                        key={mode}
                        type="button"
                        variant={config.mode === mode ? 'default' : 'outline'}
                        className={config.mode === mode 
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                          : 'border-slate-700 text-slate-400'
                        }
                        onClick={() => setConfig({ ...config, mode })}
                      >
                        {getModeLabel(mode)}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{getPlayersCount(config.mode)} jugadores</p>
                </div>

                {/* Target Score */}
                <div className="space-y-2">
                  <Label className="text-slate-200">Puntos para ganar</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={config.targetScore === 15 ? 'default' : 'outline'}
                      className={config.targetScore === 15 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                        : 'border-slate-700 text-slate-400'
                      }
                      onClick={() => setConfig({ ...config, targetScore: 15 })}
                    >
                      15 puntos
                    </Button>
                    <Button
                      type="button"
                      variant={config.targetScore === 30 ? 'default' : 'outline'}
                      className={config.targetScore === 30 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                        : 'border-slate-700 text-slate-400'
                      }
                      onClick={() => setConfig({ ...config, targetScore: 30 })}
                    >
                      30 puntos
                    </Button>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-200">Flor</Label>
                      <p className="text-xs text-slate-500">3 cartas del mismo palo</p>
                    </div>
                    <Switch
                      checked={config.florEnabled}
                      onCheckedChange={(checked) => setConfig({ ...config, florEnabled: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-200">Chat</Label>
                      <p className="text-xs text-slate-500">Mensajes en partida</p>
                    </div>
                    <Switch
                      checked={config.chatEnabled}
                      onCheckedChange={(checked) => setConfig({ ...config, chatEnabled: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-200">Timer</Label>
                      <p className="text-xs text-slate-500">Tiempo límite por turno</p>
                    </div>
                    <Switch
                      checked={config.timerEnabled}
                      onCheckedChange={(checked) => setConfig({ ...config, timerEnabled: checked })}
                    />
                  </div>
                  
                  {config.timerEnabled && (
                    <div className="pl-4 border-l-2 border-slate-700">
                      <Label className="text-slate-300 text-sm">Segundos por turno</Label>
                      <Select
                        value={config.timerSeconds.toString()}
                        onValueChange={(v) => setConfig({ ...config, timerSeconds: parseInt(v) })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="15">15 segundos</SelectItem>
                          <SelectItem value="25">25 segundos</SelectItem>
                          <SelectItem value="45">45 segundos</SelectItem>
                          <SelectItem value="60">60 segundos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Stake Mode */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div>
                    <Label className="text-slate-200">Modo de Apuesta</Label>
                    <Select
                      value={config.stakeMode}
                      onValueChange={(v) => setConfig({ ...config, stakeMode: v as StakeMode })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="NONE">Sin apuesta</SelectItem>
                        <SelectItem value="ENTRY_FEE">Entrada fija</SelectItem>
                        <SelectItem value="TEAM_POOL">Pozo por equipo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {config.stakeMode === 'ENTRY_FEE' && (
                    <div className="pl-4 border-l-2 border-amber-500/30">
                      <Label className="text-slate-300 text-sm">Fichas de entrada</Label>
                      <Input
                        type="number"
                        min={1}
                        value={config.entryFeeCredits}
                        onChange={(e) => setConfig({ ...config, entryFeeCredits: parseInt(e.target.value) || 0 })}
                        className="bg-slate-800 border-slate-700 mt-1"
                      />
                    </div>
                  )}
                  
                  {config.stakeMode === 'TEAM_POOL' && (
                    <div className="pl-4 border-l-2 border-amber-500/30 space-y-2">
                      <Label className="text-slate-300 text-sm">Total del pozo por equipo</Label>
                      <Input
                        type="number"
                        min={1}
                        value={config.stakeTotalCredits}
                        onChange={(e) => setConfig({ ...config, stakeTotalCredits: parseInt(e.target.value) || 0 })}
                        className="bg-slate-800 border-slate-700"
                      />
                      <p className="text-xs text-slate-500">
                        Cada equipo debe juntar {config.stakeTotalCredits} fichas entre todos sus jugadores
                      </p>
                    </div>
                  )}
                </div>

                {/* User Balance */}
                {session?.user && (config.stakeMode !== 'NONE') && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-400">
                      Tu saldo: {session.user.creditsBalance ?? 0} fichas
                    </span>
                  </div>
                )}

                <Button 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                  onClick={handleCreateGame}
                  disabled={isCreating}
                >
                  {isCreating ? 'Creando...' : 'Crear Partida'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Join Game */}
        <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
          <DialogTrigger asChild>
            <Card className="bg-slate-900/50 border-slate-800 hover:border-green-500/30 cursor-pointer transition-all group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all">
                  <Hash className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Unirse con Código</h3>
                <p className="text-sm text-slate-500">Ingresá a una partida existente</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Unirse a Partida</DialogTitle>
              <DialogDescription className="text-slate-400">
                Ingresá el código que te compartieron
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Código de Partida</Label>
                <Input
                  placeholder="Ej: ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="bg-slate-800 border-slate-700 text-center text-2xl font-mono tracking-widest uppercase"
                  maxLength={6}
                />
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                onClick={handleJoinGame}
                disabled={isJoining || !joinCode.trim()}
              >
                {isJoining ? 'Uniéndose...' : 'Unirse'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* My Games */}
        <Link href="/mis-partidas">
          <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/30 cursor-pointer transition-all group h-full">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-4 group-hover:from-purple-500/30 group-hover:to-violet-500/30 transition-all">
                <History className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Mis Partidas</h3>
              <p className="text-sm text-slate-500">Ver historial y estadísticas</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Info Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* How to Play */}
        <Card className="bg-slate-900/50 border-slate-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-amber-400" />
              Cómo Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-bold">1</span>
              </div>
              <div>
                <p className="text-white font-medium">Creá o unite</p>
                <p className="text-sm text-slate-500">Creá una partida y compartí los códigos, o unite con un código que te pasaron.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-bold">2</span>
              </div>
              <div>
                <p className="text-white font-medium">Esperá en el lobby</p>
                <p className="text-sm text-slate-500">Cuando todos estén listos, el creador inicia la partida.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-bold">3</span>
              </div>
              <div>
                <p className="text-white font-medium">¡A jugar!</p>
                <p className="text-sm text-slate-500">Jugá en tiempo real. El equipo que llegue a los puntos primero gana.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stake Info */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-green-400" />
              Sobre las Apuestas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="p-3 rounded-lg bg-slate-800/50">
              <p className="text-amber-400 font-medium mb-1">Sin apuesta</p>
              <p className="text-slate-500">Partida por diversión, sin fichas en juego.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50">
              <p className="text-amber-400 font-medium mb-1">Entrada fija</p>
              <p className="text-slate-500">Cada jugador paga una entrada. El pozo va al equipo ganador.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50">
              <p className="text-amber-400 font-medium mb-1">Pozo por equipo</p>
              <p className="text-slate-500">Cada equipo arma su pozo. Reparto proporcional o a un receptor.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

