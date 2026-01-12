'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { connectSocket, getSocket, type RoomState } from '@/lib/socket/client'

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
      toast.success('¡La partida comenzó!')
      router.push(`/table/${roomId}`)
    })

    socket.on('chat:message', (msg) => {
      setChatMessages(prev => [...prev, msg])
    })

    socket.on('player:joined', (data) => {
      toast.info(`${data.username} se unió al equipo ${data.team}`)
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
      router.push('/')
    } catch {
      toast.error('Error al salir')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-950 flex items-center justify-center">
        <div className="text-white text-xl">Cargando sala...</div>
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
  
  const isCreator = roomState.createdBy.id === session?.user?.id
  const canStart = teamA.length >= playersPerTeam && teamB.length >= playersPerTeam &&
    (roomState.stakeMode !== 'TEAM_POOL' || (stakeA >= (roomState.stakeTotalCredits || 0) && stakeB >= (roomState.stakeTotalCredits || 0)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-950 p-4">
      <div className="container mx-auto max-w-6xl py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Lobby de Partida</h1>
            <p className="text-green-300">
              {roomState.mode.replace(/_/g, ' ')} • {roomState.targetScore} puntos
              {roomState.florEnabled && ' • Flor'}
            </p>
          </div>
          <Button variant="outline" onClick={handleLeave} className="border-red-500 text-red-400 hover:bg-red-500/20">
            Salir
          </Button>
        </div>

        {/* Codes */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-blue-900/50 border-blue-600">
            <CardContent className="pt-4 text-center">
              <p className="text-blue-200 text-sm mb-1">Código Equipo A</p>
              <p className="text-3xl font-mono font-bold text-white tracking-widest">
                {roomState.codeTeamA}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-red-900/50 border-red-600">
            <CardContent className="pt-4 text-center">
              <p className="text-red-200 text-sm mb-1">Código Equipo B</p>
              <p className="text-3xl font-mono font-bold text-white tracking-widest">
                {roomState.codeTeamB}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Teams */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
            {/* Team A */}
            <Card className="bg-blue-900/30 border-blue-700">
              <CardHeader>
                <CardTitle className="text-blue-300 flex items-center justify-between">
                  <span>Equipo A</span>
                  <Badge variant="outline" className="border-blue-500 text-blue-300">
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
                      className={`p-3 rounded-lg ${
                        player ? 'bg-blue-800/50' : 'bg-blue-950/30 border-2 border-dashed border-blue-700'
                      }`}
                    >
                      {player ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-green-400' : 'bg-gray-500'}`} />
                            <span className="text-white font-medium">{player.user.username}</span>
                          </div>
                          {roomState.stakeMode === 'TEAM_POOL' && (
                            <span className="text-amber-400">${contribution?.amountCredits || 0}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-blue-400 text-sm">Esperando jugador...</span>
                      )}
                    </div>
                  )
                })}
                
                {roomState.stakeMode === 'TEAM_POOL' && roomState.stakeTotalCredits && (
                  <div className="pt-2 border-t border-blue-700">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-300">Pozo</span>
                      <span className="text-white">${stakeA} / ${roomState.stakeTotalCredits}</span>
                    </div>
                    <Progress value={(stakeA / roomState.stakeTotalCredits) * 100} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team B */}
            <Card className="bg-red-900/30 border-red-700">
              <CardHeader>
                <CardTitle className="text-red-300 flex items-center justify-between">
                  <span>Equipo B</span>
                  <Badge variant="outline" className="border-red-500 text-red-300">
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
                      className={`p-3 rounded-lg ${
                        player ? 'bg-red-800/50' : 'bg-red-950/30 border-2 border-dashed border-red-700'
                      }`}
                    >
                      {player ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-green-400' : 'bg-gray-500'}`} />
                            <span className="text-white font-medium">{player.user.username}</span>
                          </div>
                          {roomState.stakeMode === 'TEAM_POOL' && (
                            <span className="text-amber-400">${contribution?.amountCredits || 0}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-red-400 text-sm">Esperando jugador...</span>
                      )}
                    </div>
                  )
                })}
                
                {roomState.stakeMode === 'TEAM_POOL' && roomState.stakeTotalCredits && (
                  <div className="pt-2 border-t border-red-700">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-300">Pozo</span>
                      <span className="text-white">${stakeB} / ${roomState.stakeTotalCredits}</span>
                    </div>
                    <Progress value={(stakeB / roomState.stakeTotalCredits) * 100} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stake Panel */}
            {roomState.stakeMode === 'TEAM_POOL' && (
              <Card className="bg-amber-900/30 border-amber-700">
                <CardHeader>
                  <CardTitle className="text-amber-300 text-lg">💰 Tu Aporte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-200">$</span>
                    <Input
                      type="number"
                      min={0}
                      max={session?.user?.creditsBalance || 0}
                      value={myStake}
                      onChange={(e) => handleStakeUpdate(parseInt(e.target.value) || 0)}
                      className="bg-amber-950/50 border-amber-600 text-white text-xl text-center"
                    />
                  </div>
                  <p className="text-amber-300 text-xs">
                    Tu saldo: ${session?.user?.creditsBalance || 0} créditos
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Chat */}
            {roomState.chatEnabled && (
              <Card className="bg-green-900/30 border-green-700">
                <CardHeader>
                  <CardTitle className="text-green-300 text-lg">💬 Chat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScrollArea className="h-32 bg-green-950/30 rounded p-2">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="text-sm mb-1">
                        <span className="text-green-400 font-medium">{msg.username}:</span>{' '}
                        <span className="text-white">{msg.message}</span>
                      </div>
                    ))}
                    {chatMessages.length === 0 && (
                      <p className="text-green-500 text-sm">Sin mensajes aún...</p>
                    )}
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escribí un mensaje..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                      className="bg-green-950/50 border-green-600 text-white placeholder:text-green-500"
                    />
                    <Button onClick={handleSendChat} size="sm" className="bg-green-600 hover:bg-green-700">
                      Enviar
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
                className="w-full py-6 text-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
              >
                {canStart ? '🎮 Iniciar Partida' : '⏳ Esperando jugadores...'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

