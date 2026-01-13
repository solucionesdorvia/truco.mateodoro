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
          (s: { oderId: string }) => s.oderId === session.user.id
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
        (s: { oderId: string }) => s.oderId === session.user.id
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
    <div className="min-h-screen bg-noche relative">
      {/* Ambient paño glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-paño/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative container mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Badge className="bg-paño/20 text-paño-50 border-paño/30 mb-2">
              <Swords className="w-3 h-3 mr-1" />
              Lobby
            </Badge>
            <h1 className="text-2xl lg:text-3xl font-bold text-naipe tracking-tight">
              {getModeLabel()} • {roomState.targetScore} puntos
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {roomState.florEnabled && (
                <Badge className="bg-oro/20 text-oro border-oro/30 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Flor
                </Badge>
              )}
              {roomState.timerEnabled && (
                <Badge className="bg-celeste/20 text-celeste border-celeste/30 text-xs">
                  <Timer className="w-3 h-3 mr-1" />
                  {roomState.timerSeconds}s
                </Badge>
              )}
              {roomState.stakeMode === 'TEAM_POOL' && (
                <Badge className="bg-oro/20 text-oro border-oro/30 text-xs">
                  <Coins className="w-3 h-3 mr-1" />
                  Pozo {totalStake} por equipo
                </Badge>
              )}
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLeave} 
            className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-club"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>

        {/* Team Codes */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-club bg-equipoA-bg border-2 border-equipoA-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-equipoA font-semibold mb-1">CÓDIGO EQUIPO A</p>
                <p className="text-3xl font-mono font-bold text-naipe tracking-[0.2em]">
                  {roomState.codeTeamA}
                </p>
              </div>
              <Button 
                size="icon"
                variant="ghost"
                onClick={() => copyCode(roomState.codeTeamA)}
                className="text-equipoA hover:bg-equipoA/20"
              >
                {copiedCode === roomState.codeTeamA ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          <div className="p-4 rounded-club bg-equipoB-bg border-2 border-equipoB-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-equipoB font-semibold mb-1">CÓDIGO EQUIPO B</p>
                <p className="text-3xl font-mono font-bold text-naipe tracking-[0.2em]">
                  {roomState.codeTeamB}
                </p>
              </div>
              <Button 
                size="icon"
                variant="ghost"
                onClick={() => copyCode(roomState.codeTeamB)}
                className="text-equipoB hover:bg-equipoB/20"
              >
                {copiedCode === roomState.codeTeamB ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Teams Panel */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
            {/* Team A */}
            <Card className="card-club border-0 overflow-hidden">
              <div className="h-1 bg-equipoA" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-naipe flex items-center gap-2">
                    <Users className="w-5 h-5 text-equipoA" />
                    Equipo A
                  </span>
                  <Badge className={`${teamA.length >= playersPerTeam ? 'bg-paño/20 text-paño-50 border-paño/30' : 'bg-noche-200 text-naipe-600 border-paño/20'}`}>
                    {teamA.length}/{playersPerTeam}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: playersPerTeam }).map((_, i) => {
                  const player = teamA.find(p => p.seatIndex === i)
                  const contribution = roomState.stakeContributions?.find(
                    s => s.oderId === player?.user.id
                  )
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-club transition-all ${
                        player 
                          ? 'bg-equipoA-bg border border-equipoA-border' 
                          : 'bg-noche-200/50 border-2 border-dashed border-paño/20'
                      }`}
                    >
                      {player ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-paño-50 animate-pulse' : 'bg-naipe-700'}`} />
                            <span className="text-naipe font-semibold">{player.user.username}</span>
                            {player.user.id === roomState.createdBy.id && (
                              <Crown className="w-3 h-3 text-oro" />
                            )}
                          </div>
                          {roomState.stakeMode === 'TEAM_POOL' && (
                            <span className="chip chip-sm">{contribution?.amountCredits || 0}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-naipe-700 text-sm">Esperando jugador...</span>
                      )}
                    </div>
                  )
                })}
                
                {/* Stake Progress */}
                {roomState.stakeMode === 'TEAM_POOL' && totalStake > 0 && (
                  <div className="pt-3 border-t border-paño/20">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-naipe-600">Pozo equipo</span>
                      <span className={`font-bold tabular-nums ${stakeA >= totalStake ? 'text-paño-50' : 'text-naipe'}`}>
                        {stakeA} / {totalStake}
                      </span>
                    </div>
                    <div className="h-2 bg-noche-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${stakeA >= totalStake ? 'bg-paño' : 'bg-equipoA'}`}
                        style={{ width: `${Math.min((stakeA / totalStake) * 100, 100)}%` }}
                      />
                    </div>
                    {stakeA >= totalStake && (
                      <p className="text-paño-50 text-xs mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Pozo completo
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team B */}
            <Card className="card-club border-0 overflow-hidden">
              <div className="h-1 bg-equipoB" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-naipe flex items-center gap-2">
                    <Users className="w-5 h-5 text-equipoB" />
                    Equipo B
                  </span>
                  <Badge className={`${teamB.length >= playersPerTeam ? 'bg-paño/20 text-paño-50 border-paño/30' : 'bg-noche-200 text-naipe-600 border-paño/20'}`}>
                    {teamB.length}/{playersPerTeam}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: playersPerTeam }).map((_, i) => {
                  const player = teamB.find(p => p.seatIndex === i)
                  const contribution = roomState.stakeContributions?.find(
                    s => s.oderId === player?.user.id
                  )
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-club transition-all ${
                        player 
                          ? 'bg-equipoB-bg border border-equipoB-border' 
                          : 'bg-noche-200/50 border-2 border-dashed border-paño/20'
                      }`}
                    >
                      {player ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-paño-50 animate-pulse' : 'bg-naipe-700'}`} />
                            <span className="text-naipe font-semibold">{player.user.username}</span>
                            {player.user.id === roomState.createdBy.id && (
                              <Crown className="w-3 h-3 text-oro" />
                            )}
                          </div>
                          {roomState.stakeMode === 'TEAM_POOL' && (
                            <span className="chip chip-sm">{contribution?.amountCredits || 0}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-naipe-700 text-sm">Esperando jugador...</span>
                      )}
                    </div>
                  )
                })}
                
                {/* Stake Progress */}
                {roomState.stakeMode === 'TEAM_POOL' && totalStake > 0 && (
                  <div className="pt-3 border-t border-paño/20">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-naipe-600">Pozo equipo</span>
                      <span className={`font-bold tabular-nums ${stakeB >= totalStake ? 'text-paño-50' : 'text-naipe'}`}>
                        {stakeB} / {totalStake}
                      </span>
                    </div>
                    <div className="h-2 bg-noche-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${stakeB >= totalStake ? 'bg-paño' : 'bg-equipoB'}`}
                        style={{ width: `${Math.min((stakeB / totalStake) * 100, 100)}%` }}
                      />
                    </div>
                    {stakeB >= totalStake && (
                      <p className="text-paño-50 text-xs mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Pozo completo
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stake Panel */}
            {roomState.stakeMode === 'TEAM_POOL' && (
              <Card className="card-club border-0 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-oro to-oro-dark" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-naipe flex items-center gap-2">
                    <Coins className="w-5 h-5 text-oro" />
                    Tu aporte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-naipe-600 text-xs mb-2 block">Fichas a aportar</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={session?.user?.creditsBalance || 0}
                        value={myStake}
                        onChange={(e) => handleStakeUpdate(parseInt(e.target.value) || 0)}
                        className="bg-noche-200 border-oro/30 text-naipe text-xl text-center font-bold rounded-club"
                      />
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-club bg-noche-200 flex items-center justify-between">
                    <span className="text-naipe-600 text-sm">Tu saldo</span>
                    <span className="chip">{session?.user?.creditsBalance || 0}</span>
                  </div>

                  {/* Payout Mode selector */}
                  <div>
                    <Label className="text-naipe-600 text-xs mb-2 block">Modo de reparto</Label>
                    <Select value={payoutMode} onValueChange={(v: 'PROPORTIONAL' | 'SINGLE_RECEIVER') => setPayoutMode(v)}>
                      <SelectTrigger className="bg-noche-200 border-paño/20 text-naipe rounded-club">
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
                    <p className="text-naipe-700 text-xs mt-2">
                      {payoutMode === 'PROPORTIONAL' 
                        ? 'Cada uno recibe según su aporte'
                        : 'Un jugador elegido recibe todo'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chat */}
            {roomState.chatEnabled && (
              <Card className="card-club border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-naipe flex items-center gap-2 text-base">
                    <MessageSquare className="w-5 h-5 text-paño-50" />
                    Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScrollArea className="h-32 bg-noche-200 rounded-club p-3">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="text-sm mb-2">
                        <span className="text-paño-50 font-semibold">{msg.username}:</span>{' '}
                        <span className="text-naipe-300">{msg.message}</span>
                      </div>
                    ))}
                    {chatMessages.length === 0 && (
                      <p className="text-naipe-700 text-sm text-center py-4">Sin mensajes</p>
                    )}
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escribí un mensaje..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                      className="bg-noche-200 border-paño/20 text-naipe placeholder:text-naipe-700 rounded-club"
                    />
                    <Button onClick={handleSendChat} size="icon" className="bg-paño hover:bg-paño-100 shrink-0 rounded-club">
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
                className={`w-full py-6 text-lg rounded-club transition-all ${
                  canStart 
                    ? 'btn-pano glow-pano' 
                    : 'bg-noche-200 text-naipe-700 cursor-not-allowed'
                }`}
              >
                {canStart ? (
                  <>
                    <Swords className="w-5 h-5 mr-2" />
                    Iniciar partida
                  </>
                ) : (
                  <>
                    <Timer className="w-5 h-5 mr-2" />
                    {!teamsComplete ? 'Esperando jugadores...' : 'Completando pozos...'}
                  </>
                )}
              </Button>
            )}

            {!isCreator && (
              <div className="p-4 rounded-club bg-noche-200 border border-paño/20 text-center">
                <p className="text-naipe-400 text-sm">
                  Esperando que <span className="text-naipe font-semibold">{roomState.createdBy.username}</span> inicie la partida
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
