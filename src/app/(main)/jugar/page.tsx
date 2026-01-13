'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { 
  Plus, 
  Hash,
  Copy,
  Check,
  ArrowRight,
  Coins,
  Users,
  Sparkles,
  Search,
  RefreshCw,
  Clock
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
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

type GameMode = 'ONE_VS_ONE' | 'TWO_VS_TWO' | 'THREE_VS_THREE'
type StakeMode = 'NONE' | 'ENTRY_FEE' | 'TEAM_POOL'
type TabType = 'buscar' | 'crear' | 'unirse'

interface CreateGameConfig {
  mode: GameMode
  targetScore: 15 | 30
  florEnabled: boolean
  stakeMode: StakeMode
  entryFeeCredits: number
  stakeTotalCredits: number
}

interface CreatedRoom {
  id: string
  codeTeamA: string
  codeTeamB: string
}

interface ActiveRoom {
  id: string
  mode: string
  targetScore: number
  florEnabled: boolean
  stakeMode: string
  entryFeeCredits: number | null
  stakeTotalCredits: number | null
  codeTeamA: string
  codeTeamB: string
  createdBy: { id: string; username: string }
  currentPlayers: number
  totalSlots: number
  teamACount: number
  teamBCount: number
  teamASlots: number
  teamBSlots: number
}

export default function JugarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  // Leer el modo desde query params (ej: /jugar?mode=ONE_VS_ONE)
  const initialMode = searchParams.get('mode') || 'ALL'
  
  const [activeTab, setActiveTab] = useState<TabType>('buscar')
  const [modeFilter, setModeFilter] = useState<string>(initialMode)
  const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  
  // Crear mesa
  const [isCreating, setIsCreating] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createdRoom, setCreatedRoom] = useState<CreatedRoom | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  
  // Unirse
  const [joinCode, setJoinCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  
  const [config, setConfig] = useState<CreateGameConfig>({
    mode: 'TWO_VS_TWO',
    targetScore: 15,
    florEnabled: false,
    stakeMode: 'NONE',
    entryFeeCredits: 10,
    stakeTotalCredits: 100,
  })

  // Fetch active rooms
  const fetchRooms = useCallback(async () => {
    setIsLoadingRooms(true)
    try {
      const url = modeFilter === 'ALL' 
        ? '/api/rooms/active' 
        : `/api/rooms/active?mode=${modeFilter}`
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        setActiveRooms(data.rooms)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setIsLoadingRooms(false)
    }
  }, [modeFilter])

  useEffect(() => {
    fetchRooms()
    // Refresh every 10 seconds
    const interval = setInterval(fetchRooms, 10000)
    return () => clearInterval(interval)
  }, [fetchRooms])

  const handleCreateGame = async () => {
    setIsCreating(true)
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          chatEnabled: true,
          timerEnabled: false,
          timerSeconds: 25,
        }),
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

  const handleJoinGame = async (code?: string) => {
    const codeToUse = code || joinCode
    if (!codeToUse.trim()) {
      toast.error('Ingresá un código')
      return
    }
    
    setIsJoining(true)
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToUse.toUpperCase() }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al unirse')
      }
      
      toast.success('¡Entraste a la mesa!')
      router.push(`/lobby/${data.roomId}`)
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

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'ONE_VS_ONE': return '1v1'
      case 'TWO_VS_TWO': return '2v2'
      case 'THREE_VS_THREE': return '3v3'
      default: return mode
    }
  }

  const getModeDesc = (mode: string) => {
    switch (mode) {
      case 'ONE_VS_ONE': return 'Mano a mano'
      case 'TWO_VS_TWO': return 'Duplas'
      case 'THREE_VS_THREE': return 'Equipos'
      default: return ''
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
    setConfig({
      mode: 'TWO_VS_TWO',
      targetScore: 15,
      florEnabled: false,
      stakeMode: 'NONE',
      entryFeeCredits: 10,
      stakeTotalCredits: 100,
    })
  }

  const getStakeBadge = (room: ActiveRoom) => {
    if (room.stakeMode === 'NONE') {
      return <Badge className="bg-paño/20 text-paño-50 border-paño/30">Gratis</Badge>
    }
    if (room.stakeMode === 'ENTRY_FEE') {
      return (
        <Badge className="bg-oro/20 text-oro border-oro/30">
          <Coins className="w-3 h-3 mr-1" />
          {room.entryFeeCredits}
        </Badge>
      )
    }
    if (room.stakeMode === 'TEAM_POOL') {
      return (
        <Badge className="bg-oro/20 text-oro border-oro/30">
          <Coins className="w-3 h-3 mr-1" />
          {room.stakeTotalCredits}/eq
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header compacto con 3 acciones */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="flex-1 grid grid-cols-3 gap-2">
          <Button
            variant={activeTab === 'buscar' ? 'default' : 'outline'}
            className={`rounded-club ${activeTab === 'buscar' ? 'btn-pano' : 'border-paño/30 text-naipe-400 hover:bg-paño/10'}`}
            onClick={() => setActiveTab('buscar')}
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar mesa
          </Button>
          <Button
            variant={activeTab === 'crear' ? 'default' : 'outline'}
            className={`rounded-club ${activeTab === 'crear' ? 'btn-oro' : 'border-oro/30 text-oro hover:bg-oro/10'}`}
            onClick={() => {
              setActiveTab('crear')
              setCreateDialogOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear mesa
          </Button>
          <Button
            variant={activeTab === 'unirse' ? 'default' : 'outline'}
            className={`rounded-club ${activeTab === 'unirse' ? 'bg-celeste hover:bg-celeste-dark text-noche' : 'border-celeste/30 text-celeste hover:bg-celeste/10'}`}
            onClick={() => setActiveTab('unirse')}
          >
            <Hash className="w-4 h-4 mr-2" />
            Unirse
          </Button>
        </div>
      </div>

      {/* Panel de Unirse con código */}
      {activeTab === 'unirse' && (
        <Card className="card-club border-0 mb-6">
          <CardContent className="p-6">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-center mb-4">
                <Hash className="w-10 h-10 text-celeste mx-auto mb-2" />
                <h2 className="text-xl font-bold text-naipe">Unirse con código</h2>
                <p className="text-sm text-naipe-600">Ingresá el código de equipo que te pasaron</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-naipe-300 text-sm">Código de mesa</Label>
                <Input
                  placeholder="ABCD1234"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="bg-noche-200 border-celeste/30 text-center text-2xl font-mono font-bold tracking-[0.2em] uppercase text-naipe h-16"
                  maxLength={8}
                />
              </div>
              
              <Button 
                className="w-full bg-celeste hover:bg-celeste-dark text-noche font-bold rounded-club"
                onClick={() => handleJoinGame()}
                disabled={isJoining || !joinCode.trim()}
              >
                {isJoining ? 'Entrando...' : 'Entrar a la mesa'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de mesas activas */}
      {activeTab === 'buscar' && (
        <>
          {/* Filtro por modo */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Label className="text-naipe-400 text-sm hidden sm:block">Filtrar:</Label>
              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger className="w-32 bg-noche-200 border-paño/20 text-naipe rounded-club">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-noche-200 border-paño/20">
                  <SelectItem value="ALL">Todas</SelectItem>
                  <SelectItem value="ONE_VS_ONE">1v1</SelectItem>
                  <SelectItem value="TWO_VS_TWO">2v2</SelectItem>
                  <SelectItem value="THREE_VS_THREE">3v3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={fetchRooms}
              disabled={isLoadingRooms}
              className="text-naipe-600 hover:text-naipe"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingRooms ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Lista de mesas */}
          <Card className="card-club border-0">
            <CardHeader className="border-b border-paño/20 py-4">
              <CardTitle className="text-naipe flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-paño" />
                  Mesas activas
                </span>
                <Badge className="bg-paño/20 text-paño-50 border-paño/30">
                  {activeRooms.length} disponibles
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoadingRooms ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 bg-noche-200 rounded-club" />
                  ))}
                </div>
              ) : activeRooms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-noche-200 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-naipe-700" />
                  </div>
                  <p className="text-naipe-400 mb-2">No hay mesas disponibles</p>
                  <p className="text-naipe-700 text-sm mb-4">¡Creá una y esperá que se unan!</p>
                  <Button 
                    className="btn-oro"
                    onClick={() => {
                      setActiveTab('crear')
                      setCreateDialogOpen(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear mesa
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-2">
                  <div className="space-y-3">
                    {activeRooms.map((room) => (
                      <div 
                        key={room.id}
                        className="p-4 rounded-club bg-noche-200 border border-paño/10 hover:border-paño/30 transition-all"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {/* Mode badge grande */}
                            <div className="w-14 h-14 rounded-club bg-paño/10 border border-paño/30 flex flex-col items-center justify-center">
                              <span className="text-xl font-bold text-naipe">{getModeLabel(room.mode)}</span>
                              <span className="text-[10px] text-naipe-700">{room.targetScore}pts</span>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {getStakeBadge(room)}
                                {room.florEnabled && (
                                  <Badge className="bg-oro/10 text-oro border-oro/20 text-xs">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Flor
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-naipe-600">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {room.currentPlayers}/{room.totalSlots}
                                </span>
                                <span className="text-naipe-700">•</span>
                                <span className="text-naipe-700">por @{room.createdBy.username}</span>
                              </div>
                              {/* Plazas por equipo */}
                              <div className="flex items-center gap-2 mt-2 text-xs">
                                <span className="text-equipoA">A: {room.teamACount}/{room.teamASlots}</span>
                                <span className="text-naipe-700">|</span>
                                <span className="text-equipoB">B: {room.teamBCount}/{room.teamBSlots}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Botones compactos A/B */}
                          <div className="flex gap-1.5">
                            {room.teamACount < room.teamASlots && (
                              <Button 
                                size="icon"
                                className="bg-equipoA hover:bg-equipoA/80 text-white rounded-club w-10 h-10 font-bold text-lg"
                                onClick={() => handleJoinGame(room.codeTeamA)}
                                disabled={isJoining}
                                title="Unirse al Equipo A"
                              >
                                A
                              </Button>
                            )}
                            {room.teamBCount < room.teamBSlots && (
                              <Button 
                                size="icon"
                                className="bg-equipoB hover:bg-equipoB/80 text-white rounded-club w-10 h-10 font-bold text-lg"
                                onClick={() => handleJoinGame(room.codeTeamB)}
                                disabled={isJoining}
                                title="Unirse al Equipo B"
                              >
                                B
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal Crear Mesa */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        setCreateDialogOpen(open)
        if (!open) {
          resetCreateDialog()
          setActiveTab('buscar')
        }
      }}>
        <DialogContent className="bg-noche-100 border-paño/20 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-naipe flex items-center gap-2">
              <Plus className="w-5 h-5 text-oro" />
              {createdRoom ? 'Mesa lista' : 'Crear mesa'}
            </DialogTitle>
            <DialogDescription className="text-naipe-600">
              {createdRoom 
                ? 'Compartí los códigos con tu equipo' 
                : 'Configurá tu partida'}
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
          ) : (
            /* Create Form - Todo en una pantalla */
            <div className="space-y-6 py-4">
              {/* Mode Selection */}
              <div className="space-y-3">
                <Label className="text-naipe-300 text-sm">Modo de juego</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['ONE_VS_ONE', 'TWO_VS_TWO', 'THREE_VS_THREE'] as GameMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`p-3 rounded-club border-2 transition-all duration-200 ${
                        config.mode === mode 
                          ? 'bg-paño/20 border-paño text-naipe' 
                          : 'bg-noche-200 border-paño/20 text-naipe-600 hover:border-paño/40'
                      }`}
                      onClick={() => setConfig({ ...config, mode })}
                    >
                      <div className="text-xl font-bold">{getModeLabel(mode)}</div>
                      <div className="text-[10px] mt-1 opacity-70">{getModeDesc(mode)}</div>
                    </button>
                  ))}
                </div>
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

              {/* Flor toggle */}
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

              {/* Economía */}
              <div className="space-y-3 pt-4 border-t border-paño/20">
                <Label className="text-naipe-300 text-sm">Economía</Label>
                <div className="space-y-2">
                  {[
                    { value: 'NONE', label: 'Gratis', desc: 'Sin fichas', icon: '🎮' },
                    { value: 'ENTRY_FEE', label: 'Entrada fija', desc: 'Cada jugador paga igual', icon: '🎟️' },
                    { value: 'TEAM_POOL', label: 'Pozo por equipo', desc: 'Cada equipo arma su pozo', icon: '💰' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`w-full p-3 rounded-club border-2 text-left transition-all ${
                        config.stakeMode === option.value 
                          ? 'bg-paño/20 border-paño' 
                          : 'bg-noche-200 border-paño/20 hover:border-paño/40'
                      }`}
                      onClick={() => setConfig({ ...config, stakeMode: option.value as StakeMode })}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{option.icon}</span>
                        <div>
                          <div className="font-semibold text-naipe text-sm">{option.label}</div>
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
                    Cada equipo junta {config.stakeTotalCredits}. Pozo total: {config.stakeTotalCredits * 2} fichas.
                  </p>
                </div>
              )}

              {/* Balance preview */}
              {session?.user && config.stakeMode !== 'NONE' && (
                <div className="flex items-center gap-2 p-3 rounded-club bg-noche-200 border border-paño/20">
                  <Badge className="bg-oro/20 text-oro border-oro/30">{session.user.creditsBalance ?? 0}</Badge>
                  <span className="text-sm text-naipe-600">Tu saldo actual</span>
                </div>
              )}

              <Button 
                className="w-full btn-oro"
                onClick={handleCreateGame}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear mesa
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Botón sticky para crear en mobile */}
      {activeTab === 'buscar' && (
        <div className="fixed bottom-20 right-4 lg:hidden z-40">
          <Button
            className="btn-oro shadow-lg shadow-oro/30 rounded-full w-14 h-14"
            onClick={() => {
              setActiveTab('crear')
              setCreateDialogOpen(true)
            }}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  )
}
