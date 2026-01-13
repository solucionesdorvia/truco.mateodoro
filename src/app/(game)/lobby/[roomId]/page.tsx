'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { 
  Users, 
  Copy, 
  Check, 
  LogOut, 
  Coins, 
  MessageSquare, 
  Send,
  Swords,
  Target,
  Crown,
  Sparkles,
  Timer
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { connectSocket, getSocket, type RoomState } from '@/lib/socket/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function LobbyPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const roomId = params.roomId as string

  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [myStake, setMyStake] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; username: string; message: string; timestamp: string }>>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [payoutMode, setPayoutMode] = useState<'PROPORTIONAL' | 'SINGLE_RECEIVER'>('PROPORTIONAL')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    // Fetch initial room state
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`)
        const data = await response.json()
        if (!response.ok) {
          toast.error(data.error || 'Error al cargar la sala')
          router.push('/')
          return
        }
        setRoomState(data.room)
        
        // Set initial stake contribution
        const myContribution = data.room.stakeContributions?.find(
          (s: { oderId?: string; userId?: string }) => (s.userId || s.oderId) === session.user.id
        )
        if (myContribution) {
          setMyStake(myContribution.amountCredits)
        }
        
        setIsLoading(false)
      } catch {
        toast.error('Error al cargar la sala')
        router.push('/')
      }
    }

    fetchRoom()

    // Connect socket
    const socket = connectSocket()
    
    socket.emit('room:join', { roomId, oderId: session.user.id })

    socket.on('room:state', (state: RoomState) => {
      setRoomState(state)
      const myContribution = state.stakeContributions?.find(
        (s: { oderId?: string; userId?: string }) => (s.userId || s.oderId) === session.user.id
      )
      if (myContribution) {
        setMyStake(myContribution.amountCredits)
      }
    })

    socket.on('game:started', () => {
      toast.success('¡Arrancó la partida!')
      router.push(`/table/${roomId}`)
    })

    socket.on('chat:message', (msg) => {
      setChatMessages(prev => [...prev, msg])
    })

    socket.on('player:joined', (data) => {
      toast.info(`${data.username} entró al equipo ${data.team}`)
    })

    socket.on('player:disconnected', () => {
      toast.warning('Un jugador se desconectó')
    })

    socket.on('error', (err) => {
      toast.error(err.message)
    })

    return () => {
      socket.off('room:state')
      socket.off('game:started')
      socket.off('chat:message')
      socket.off('player:joined')
      socket.off('player:disconnected')
      socket.off('error')
    }
  }, [roomId, session, status, router])

  const handleStakeUpdate = useCallback((amount: number) => {
    if (!session) return
    const socket = getSocket()
    socket.emit('stake:update', { roomId, amount })
    setMyStake(amount)
  }, [roomId, session])

  const handleStartGame = useCallback(() => {
    const socket = getSocket()
    socket.emit('game:start', { roomId })
  }, [roomId])

  const handleSendChat = useCallback(() => {
    if (!chatMessage.trim()) return
    const socket = getSocket()
    socket.emit('chat:send', { roomId, message: chatMessage })
    setChatMessage('')
  }, [roomId, chatMessage])

  const handleLeave = async () => {
    try {
      await fetch(`/api/rooms/${roomId}/leave`, { method: 'POST' })
      router.push('/jugar')
    } catch {
      toast.error('Error al salir')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Código copiado')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-noche flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-paño/20 border border-paño/40 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Swords className="w-8 h-8 text-paño-50" />
          </div>
          <p className="text-naipe-400">Cargando lobby...</p>
        </div>
      </div>
    )
  }

  if (!roomState) {
    return null
  }

  const playersPerTeam = roomState.mode === 'ONE_VS_ONE' ? 1 : roomState.mode === 'TWO_VS_TWO' ? 2 : 3
  const teamA = roomState.players.filter(p => p.team === 'A')
  const teamB = roomState.players.filter(p => p.team === 'B')
  
  const stakeA = roomState.stakeContributions?.filter(s => s.team === 'A').reduce((sum, s) => sum + s.amountCredits, 0) || 0
  const stakeB = roomState.stakeContributions?.filter(s => s.team === 'B').reduce((sum, s) => sum + s.amountCredits, 0) || 0
  const totalStake = roomState.stakeTotalCredits || 0
  
  const isCreator = roomState.createdBy.id === session?.user?.id
  const teamsComplete = teamA.length >= playersPerTeam && teamB.length >= playersPerTeam
  const stakeComplete = roomState.stakeMode !== 'TEAM_POOL' || (stakeA >= totalStake && stakeB >= totalStake)
  const canStart = teamsComplete && stakeComplete

  const getModeLabel = () => {
    switch(roomState.mode) {
      case 'ONE_VS_ONE': return '1v1'
      case 'TWO_VS_TWO': return '2v2'
      case 'THREE_VS_THREE': return '3v3'
    }
  }

  return (
    <div className="min-h-[100svh] bg-noche relative flex flex-col">
      {/* Ambient paño glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-paño/10 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Main scrollable container */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-6xl px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {/* Header - shrink-0 to prevent compression */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
            <div className="min-w-0 flex-1">
              <Badge className="bg-paño/20 text-paño-50 border-paño/30 mb-2">
                <Swords className="w-3 h-3 mr-1" />
                Lobby
              </Badge>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-naipe tracking-tight whitespace-nowrap">
                {getModeLabel()} • {roomState.targetScore} pts
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {roomState.florEnabled && (
                  <Badge className="bg-oro/20 text-oro border-oro/30 text-xs whitespace-nowrap">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Flor
                  </Badge>
                )}
                {roomState.timerEnabled && (
                  <Badge className="bg-celeste/20 text-celeste border-celeste/30 text-xs whitespace-nowrap">
                    <Timer className="w-3 h-3 mr-1" />
                    {roomState.timerSeconds}s
                  </Badge>
                )}
                {roomState.stakeMode === 'TEAM_POOL' && (
                  <Badge className="bg-oro/20 text-oro border-oro/30 text-xs whitespace-nowrap">
                    <Coins className="w-3 h-3 mr-1" />
                    Pozo {totalStake}/eq
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLeave} 
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-club shrink-0 self-start sm:self-center"
            >
              <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="sm:inline">Salir</span>
            </Button>
          </header>

          {/* Team Codes - compact on mobile */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
            <div className="p-2 sm:p-4 rounded-club bg-equipoA-bg border-2 border-equipoA-border">
              <div className="flex items-center justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-equipoA font-semibold mb-0.5 sm:mb-1 truncate">CÓDIGO A</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-mono font-bold text-naipe tracking-wider sm:tracking-[0.2em] truncate">
                    {roomState.codeTeamA}
                  </p>
                </div>
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={() => copyCode(roomState.codeTeamA)}
                  className="text-equipoA hover:bg-equipoA/20 h-8 w-8 sm:h-10 sm:w-10 shrink-0"
                >
                  {copiedCode === roomState.codeTeamA ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
                </Button>
              </div>
            </div>
            <div className="p-2 sm:p-4 rounded-club bg-equipoB-bg border-2 border-equipoB-border">
              <div className="flex items-center justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-equipoB font-semibold mb-0.5 sm:mb-1 truncate">CÓDIGO B</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-mono font-bold text-naipe tracking-wider sm:tracking-[0.2em] truncate">
                    {roomState.codeTeamB}
                  </p>
                </div>
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={() => copyCode(roomState.codeTeamB)}
                  className="text-equipoB hover:bg-equipoB/20 h-8 w-8 sm:h-10 sm:w-10 shrink-0"
                >
                  {copiedCode === roomState.codeTeamB ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Teams Panel - stack in portrait, 2 cols in landscape/tablet */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Team A */}
              <Card className="card-club border-0 overflow-hidden">
                <div className="h-1 bg-equipoA" />
                <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                  <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                    <span className="text-naipe flex items-center gap-2 whitespace-nowrap">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-equipoA shrink-0" />
                      <span>Equipo A</span>
                    </span>
                    <Badge className={`text-xs shrink-0 ${teamA.length >= playersPerTeam ? 'bg-paño/20 text-paño-50 border-paño/30' : 'bg-noche-200 text-naipe-600 border-paño/20'}`}>
                      {teamA.length}/{playersPerTeam}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0 space-y-2 sm:space-y-3">
                  {Array.from({ length: playersPerTeam }).map((_, i) => {
                    const player = teamA.find(p => p.seatIndex === i)
                    const contribution = roomState.stakeContributions?.find(
                      s => s.userId === player?.user.id
                    )
                    return (
                      <div
                        key={i}
                        className={`p-2 sm:p-3 rounded-club transition-all ${
                          player 
                            ? 'bg-equipoA-bg border border-equipoA-border' 
                            : 'bg-noche-200/50 border-2 border-dashed border-paño/20'
                        }`}
                      >
                        {player ? (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${player.isConnected ? 'bg-paño-50 animate-pulse' : 'bg-naipe-700'}`} />
                              <span className="text-naipe font-semibold text-sm sm:text-base truncate">{player.user.username}</span>
                              {player.user.id === roomState.createdBy.id && (
                                <Crown className="w-3 h-3 text-oro shrink-0" />
                              )}
                            </div>
                            {roomState.stakeMode === 'TEAM_POOL' && (
                              <span className="chip chip-sm shrink-0">{contribution?.amountCredits || 0}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-naipe-700 text-xs sm:text-sm">Esperando...</span>
                        )}
                      </div>
                    )
                  })}
                  
                  {/* Stake Progress */}
                  {roomState.stakeMode === 'TEAM_POOL' && totalStake > 0 && (
                    <div className="pt-2 sm:pt-3 border-t border-paño/20">
                      <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
                        <span className="text-naipe-600">Pozo</span>
                        <span className={`font-bold tabular-nums ${stakeA >= totalStake ? 'text-paño-50' : 'text-naipe'}`}>
                          {stakeA}/{totalStake}
                        </span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-noche-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${stakeA >= totalStake ? 'bg-paño' : 'bg-equipoA'}`}
                          style={{ width: `${Math.min((stakeA / totalStake) * 100, 100)}%` }}
                        />
                      </div>
                      {stakeA >= totalStake && (
                        <p className="text-paño-50 text-xs mt-1.5 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Completo
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team B */}
              <Card className="card-club border-0 overflow-hidden">
                <div className="h-1 bg-equipoB" />
                <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                  <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                    <span className="text-naipe flex items-center gap-2 whitespace-nowrap">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-equipoB shrink-0" />
                      <span>Equipo B</span>
                    </span>
                    <Badge className={`text-xs shrink-0 ${teamB.length >= playersPerTeam ? 'bg-paño/20 text-paño-50 border-paño/30' : 'bg-noche-200 text-naipe-600 border-paño/20'}`}>
                      {teamB.length}/{playersPerTeam}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0 space-y-2 sm:space-y-3">
                  {Array.from({ length: playersPerTeam }).map((_, i) => {
                    const player = teamB.find(p => p.seatIndex === i)
                    const contribution = roomState.stakeContributions?.find(
                      s => s.userId === player?.user.id
                    )
                    return (
                      <div
                        key={i}
                        className={`p-2 sm:p-3 rounded-club transition-all ${
                          player 
                            ? 'bg-equipoB-bg border border-equipoB-border' 
                            : 'bg-noche-200/50 border-2 border-dashed border-paño/20'
                        }`}
                      >
                        {player ? (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${player.isConnected ? 'bg-paño-50 animate-pulse' : 'bg-naipe-700'}`} />
                              <span className="text-naipe font-semibold text-sm sm:text-base truncate">{player.user.username}</span>
                              {player.user.id === roomState.createdBy.id && (
                                <Crown className="w-3 h-3 text-oro shrink-0" />
                              )}
                            </div>
                            {roomState.stakeMode === 'TEAM_POOL' && (
                              <span className="chip chip-sm shrink-0">{contribution?.amountCredits || 0}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-naipe-700 text-xs sm:text-sm">Esperando...</span>
                        )}
                      </div>
                    )
                  })}
                  
                  {/* Stake Progress */}
                  {roomState.stakeMode === 'TEAM_POOL' && totalStake > 0 && (
                    <div className="pt-2 sm:pt-3 border-t border-paño/20">
                      <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
                        <span className="text-naipe-600">Pozo</span>
                        <span className={`font-bold tabular-nums ${stakeB >= totalStake ? 'text-paño-50' : 'text-naipe'}`}>
                          {stakeB}/{totalStake}
                        </span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-noche-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${stakeB >= totalStake ? 'bg-paño' : 'bg-equipoB'}`}
                          style={{ width: `${Math.min((stakeB / totalStake) * 100, 100)}%` }}
                        />
                      </div>
                      {stakeB >= totalStake && (
                        <p className="text-paño-50 text-xs mt-1.5 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Completo
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-3 sm:space-y-4">
              {/* Stake Panel */}
              {roomState.stakeMode === 'TEAM_POOL' && (
                <Card className="card-club border-0 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-oro to-oro-dark" />
                  <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                    <CardTitle className="text-naipe flex items-center gap-2 text-sm sm:text-base">
                      <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-oro" />
                      Tu aporte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
                    <div>
                      <Label className="text-naipe-600 text-xs mb-1.5 sm:mb-2 block">Fichas</Label>
                      <Input
                        type="number"
                        min={0}
                        max={session?.user?.creditsBalance || 0}
                        value={myStake}
                        onChange={(e) => handleStakeUpdate(parseInt(e.target.value) || 0)}
                        className="bg-noche-200 border-oro/30 text-naipe text-lg sm:text-xl text-center font-bold rounded-club"
                      />
                    </div>
                    
                    <div className="p-2 sm:p-3 rounded-club bg-noche-200 flex items-center justify-between">
                      <span className="text-naipe-600 text-xs sm:text-sm">Tu saldo</span>
                      <span className="chip chip-sm sm:chip">{session?.user?.creditsBalance || 0}</span>
                    </div>

                    {/* Payout Mode selector */}
                    <div>
                      <Label className="text-naipe-600 text-xs mb-1.5 sm:mb-2 block">Reparto</Label>
                      <Select value={payoutMode} onValueChange={(v: 'PROPORTIONAL' | 'SINGLE_RECEIVER') => setPayoutMode(v)}>
                        <SelectTrigger className="bg-noche-200 border-paño/20 text-naipe rounded-club text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-noche-200 border-paño/20">
                          <SelectItem value="PROPORTIONAL">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-paño-50" />
                              Proporcional
                            </div>
                          </SelectItem>
                          <SelectItem value="SINGLE_RECEIVER">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-celeste" />
                              Se lo lleva uno
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-naipe-700 text-[10px] sm:text-xs mt-1.5">
                        {payoutMode === 'PROPORTIONAL' 
                          ? 'Cada uno recibe según su aporte'
                          : 'Un jugador elegido recibe todo'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chat - hide on very small screens in portrait */}
              {roomState.chatEnabled && (
                <Card className="card-club border-0 hidden sm:block">
                  <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                    <CardTitle className="text-naipe flex items-center gap-2 text-sm sm:text-base">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-paño-50" />
                      Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0 space-y-2 sm:space-y-3">
                    <ScrollArea className="h-24 sm:h-32 bg-noche-200 rounded-club p-2 sm:p-3">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="text-xs sm:text-sm mb-2">
                          <span className="text-paño-50 font-semibold">{msg.username}:</span>{' '}
                          <span className="text-naipe-300">{msg.message}</span>
                        </div>
                      ))}
                      {chatMessages.length === 0 && (
                        <p className="text-naipe-700 text-xs sm:text-sm text-center py-3 sm:py-4">Sin mensajes</p>
                      )}
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Mensaje..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                        className="bg-noche-200 border-paño/20 text-naipe placeholder:text-naipe-700 rounded-club text-sm"
                      />
                      <Button onClick={handleSendChat} size="icon" className="bg-paño hover:bg-paño-100 shrink-0 rounded-club h-9 w-9">
                        <Send className="w-4 h-4 text-naipe" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Start Button */}
              {isCreator && (
                <Button
                  onClick={handleStartGame}
                  disabled={!canStart}
                  className={`w-full py-4 sm:py-6 text-base sm:text-lg rounded-club transition-all ${
                    canStart 
                      ? 'btn-pano glow-pano' 
                      : 'bg-noche-200 text-naipe-700 cursor-not-allowed'
                  }`}
                >
                  {canStart ? (
                    <>
                      <Swords className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Iniciar
                    </>
                  ) : (
                    <>
                      <Timer className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="text-sm sm:text-base">
                        {!teamsComplete ? 'Esperando...' : 'Pozos...'}
                      </span>
                    </>
                  )}
                </Button>
              )}

              {!isCreator && (
                <div className="p-3 sm:p-4 rounded-club bg-noche-200 border border-paño/20 text-center">
                  <p className="text-naipe-400 text-xs sm:text-sm">
                    Esperando a <span className="text-naipe font-semibold">{roomState.createdBy.username}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
