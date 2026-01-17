'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Crown, MessageSquare, Volume2, VolumeX, Home, Flag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrucoCard } from '@/components/game/TrucoCard'
import { connectSocket, getSocket, type GameStateView } from '@/lib/socket/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

const TRUCO_LEVELS = ['', 'TRUCO', 'RETRUCO', 'VALE 4']
const ENVIDO_CALLS: Record<string, string> = {
  ENVIDO: 'ENVIDO',
  REAL_ENVIDO: 'REAL ENVIDO',
  FALTA_ENVIDO: 'FALTA ENVIDO',
  ENVIDO_ENVIDO: 'ENVIDO ENVIDO',
}

export default function TablePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const roomId = params.roomId as string

  const [gameState, setGameState] = useState<GameStateView | null>(null)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showResult, setShowResult] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const myPlayer = gameState?.players.find(p => p.playerId === session?.user?.id)
  const isMyTurn = gameState?.hand?.turnPlayerId === session?.user?.id
  const waitingForMe = gameState?.pendingCall?.toPlayerId === session?.user?.id

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    const socket = connectSocket()
    
    socket.emit('room:join', { roomId, oderId: session.user.id })

    socket.on('game:state', (state: GameStateView) => {
      setGameState(state)
      setIsLoading(false)
      
      // Check for game end
      if (state.isFinished) {
        setShowResult(true)
      }
    })

    socket.on('game:finished', ({ winner }) => {
      toast.success(`¡Equipo ${winner} ganó!`)
      setShowResult(true)
    })

    socket.on('error', (err) => {
      toast.error(err.message)
    })

    return () => {
      socket.off('game:state')
      socket.off('game:finished')
      socket.off('error')
    }
  }, [roomId, session, status, router])

  const handlePlayCard = useCallback(() => {
    if (!selectedCard || !isMyTurn) return
    const socket = getSocket()
    socket.emit('game:playCard', { roomId, cardId: selectedCard })
    setSelectedCard(null)
  }, [roomId, selectedCard, isMyTurn])

  const handleTruco = useCallback(() => {
    const socket = getSocket()
    socket.emit('game:callTruco', { roomId })
  }, [roomId])

  const handleRespondTruco = useCallback((response: 'accept' | 'reject') => {
    const socket = getSocket()
    socket.emit('game:respondTruco', { roomId, response })
  }, [roomId])

  const handleEnvido = useCallback((call: string) => {
    const socket = getSocket()
    socket.emit('game:callEnvido', { roomId, call })
  }, [roomId])

  const handleRespondEnvido = useCallback((response: 'accept' | 'reject') => {
    const socket = getSocket()
    socket.emit('game:respondEnvido', { roomId, response })
  }, [roomId])

  const handleFlor = useCallback(() => {
    const socket = getSocket()
    socket.emit('game:callFlor', { roomId })
  }, [roomId])

  const handleRespondFlor = useCallback((response: 'accept' | 'reject') => {
    const socket = getSocket()
    socket.emit('game:respondFlor', { roomId, response })
  }, [roomId])

  const handleFold = useCallback(() => {
    const socket = getSocket()
    socket.emit('game:fold', { roomId })
  }, [roomId])

  const formatLogEntry = useCallback((entry: GameStateView['log'][number]) => {
    const player = gameState?.players.find(p => p.playerId === entry.playerId)
    const name = entry.playerId === 'system' ? 'Mesa' : player?.name || 'Jugador'
    switch (entry.type) {
      case 'HAND_DEALT':
        return `🃏 Mano nueva (${name})`
      case 'PLAY_CARD':
        return `🂠 ${name} jugó una carta`
      case 'CALL_TRUCO':
        return `⚔️ ${name} cantó truco`
      case 'TRUCO_ACCEPTED':
        return `✅ ${name} quiso el truco`
      case 'TRUCO_REJECTED':
        return `❌ ${name} no quiso el truco`
      case 'HAND_END':
        return `🏁 Mano terminada`
      case 'CALL_ENVIDO':
        return `🟦 ${name} cantó envido`
      case 'ENVIDO_ACCEPTED':
        return `✅ ${name} quiso el envido`
      case 'ENVIDO_REJECTED':
        return `❌ ${name} no quiso el envido`
      case 'CALL_FLOR':
        return `🌸 ${name} cantó flor`
      case 'FLOR_ACCEPTED':
        return `✅ ${name} quiso la flor`
      case 'FLOR_REJECTED':
        return `❌ ${name} no quiso la flor`
      case 'FOLD_TO_MAZO':
        return `🏳️ ${name} se fue al mazo`
      default:
        return `${name} ${entry.type}`
    }
  }, [gameState])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-noche flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full mesa-pano flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🃏</span>
          </div>
          <p className="text-naipe-400">Cargando partida...</p>
        </div>
      </div>
    )
  }

  if (!gameState || !myPlayer) {
    return (
      <div className="min-h-screen bg-noche flex items-center justify-center">
        <div className="text-center">
          <p className="text-naipe-400 mb-4">Error al cargar la partida</p>
          <Button onClick={() => router.push('/jugar')} className="btn-pano">
            Volver
          </Button>
        </div>
      </div>
    )
  }

  const hand = gameState.hand
  const opponents = gameState.players.filter(p => p.team !== myPlayer.team)
  const teammates = gameState.players.filter(p => p.team === myPlayer.team && p.playerId !== myPlayer.playerId)
  const playersById = new Map(gameState.players.map(player => [player.playerId, player]))

  // Can call envido?
  const hasAnyFlor = gameState.settings.florEnabled && gameState.players.some(p => p.hasFlor)
  const canCallEnvido = hand &&
    hand.currentTrickIndex === 0 &&
    hand.tricks[0].plays.length === 0 &&
    !gameState.truco.accepted &&
    !gameState.envido.resolved &&
    !gameState.pendingCall &&
    !(gameState.settings.florBlocksEnvido && hasAnyFlor)

  // Can call truco?
  const canCallTruco = hand && gameState.truco.level < 3 && !gameState.pendingCall && hand.turnPlayerId === myPlayer.playerId

  // Can call flor?
  const canCallFlor = hand &&
    gameState.flor.enabled &&
    myPlayer.hasFlor &&
    hand.currentTrickIndex === 0 &&
    hand.tricks[0].plays.length === 0 &&
    !gameState.pendingCall

  const canRaiseEnvido = (call: string) => {
    if (gameState.envido.calls.includes('FALTA_ENVIDO')) return false
    if (call === 'ENVIDO') return !gameState.envido.calls.includes('ENVIDO_ENVIDO')
    if (call === 'REAL_ENVIDO') return !gameState.envido.calls.includes('REAL_ENVIDO')
    if (call === 'FALTA_ENVIDO') return !gameState.envido.calls.includes('FALTA_ENVIDO')
    return false
  }

  return (
    <div className="min-h-screen mesa-pano relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-paño/20 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          {/* Tanteador */}
          <div className="tanteador">
            <div className="text-center">
              <p className="text-[10px] text-equipoA font-bold uppercase tracking-wide">A</p>
              <p className="tanteador-score text-equipoA">{gameState.score.teamA}</p>
            </div>
            <div className="text-naipe-700 text-xl">-</div>
            <div className="text-center">
              <p className="text-[10px] text-equipoB font-bold uppercase tracking-wide">B</p>
              <p className="tanteador-score text-equipoB">{gameState.score.teamB}</p>
            </div>
          </div>
          
          <Badge className="bg-noche/80 text-naipe-400 border-paño/30">
            A {gameState.score.target}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-naipe-600 hover:text-naipe hover:bg-noche/50"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-naipe-600 hover:text-naipe hover:bg-noche/50"
            onClick={() => router.push('/jugar')}
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Truco level indicator */}
      {gameState.truco.level > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-oro text-noche text-lg px-6 py-1.5 font-bold tracking-wide animate-pulse shadow-glow-oro">
            {TRUCO_LEVELS[gameState.truco.level]}
          </Badge>
        </div>
      )}

      {/* Turn indicator */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10">
        <Badge className={`${isMyTurn ? 'bg-paño text-naipe animate-pulse' : 'bg-noche/80 text-naipe-600'} px-4 py-1`}>
          {isMyTurn ? '¡Tu turno!' : `Turno de ${gameState.players.find(p => p.playerId === hand?.turnPlayerId)?.name || '...'}`}
        </Badge>
      </div>

      {/* Opponents (top) */}
      <div className="absolute top-36 left-1/2 -translate-x-1/2 flex gap-12">
        {opponents.map((opponent) => (
          <div key={opponent.oderId} className="text-center">
            <Badge className={`mb-2 ${opponent.team === 'A' ? 'bg-equipoA-bg text-equipoA border-equipoA-border' : 'bg-equipoB-bg text-equipoB border-equipoB-border'}`}>
              {opponent.name}
            </Badge>
            <div className="flex gap-1 justify-center">
              {opponent.handCards.map((card, i) => (
                <TrucoCard
                  key={i}
                  number={card.number}
                  suit={card.suit as 'espada' | 'basto' | 'oro' | 'copa'}
                  isHidden={card.id === 'hidden'}
                  size="sm"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Center table area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Mesa central */}
        <div className="relative w-[500px] h-[280px] rounded-[100px] bg-paño-400/20 border-4 border-paño-600/30 flex items-center justify-center">
          <div className="flex gap-16 items-center">
            {/* Team A played cards */}
            <div className="text-center">
              <p className="text-equipoA text-xs font-semibold mb-2 uppercase tracking-wide">Equipo A</p>
              <div className="flex gap-2">
                {hand?.tricks.map((trick, i) => {
                  const play = trick.plays.find(p => playersById.get(p.playerId)?.team === 'A')
                  return play?.card ? (
                    <TrucoCard
                      key={i}
                      number={play.card.number}
                      suit={play.card.suit as 'espada' | 'basto' | 'oro' | 'copa'}
                      size="md"
                    />
                  ) : null
                })}
              </div>
            </div>
            
            {/* VS divider */}
            <div className="text-3xl text-naipe-700/50 font-bold">VS</div>
            
            {/* Team B played cards */}
            <div className="text-center">
              <p className="text-equipoB text-xs font-semibold mb-2 uppercase tracking-wide">Equipo B</p>
              <div className="flex gap-2">
                {hand?.tricks.map((trick, i) => {
                  const play = trick.plays.find(p => playersById.get(p.playerId)?.team === 'B')
                  return play?.card ? (
                    <TrucoCard
                      key={i}
                      number={play.card.number}
                      suit={play.card.suit as 'espada' | 'basto' | 'oro' | 'copa'}
                      size="md"
                    />
                  ) : null
                })}
              </div>
            </div>
          </div>
          
          {/* Baza indicators */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {[0, 1, 2].map((bazaIdx) => {
                    const trick = hand?.tricks[bazaIdx]
                    const winner = trick?.winnerTeam
                    return (
                      <div 
                        key={bazaIdx}
                        className={`w-3 h-3 rounded-full transition-all ${
                          winner === 'A' ? 'bg-equipoA' :
                          winner === 'B' ? 'bg-equipoB' :
                          winner === 'tie' ? 'bg-naipe-600' :
                          'bg-noche-200'
                        }`}
                      />
                    )
                  })}
          </div>
        </div>
      </div>

      {/* Teammates (middle) */}
      {teammates.length > 0 && (
        <div className="absolute bottom-48 left-1/2 -translate-x-1/2 flex gap-12">
          {teammates.map((teammate) => (
            <div key={teammate.oderId} className="text-center">
              <div className="flex gap-1 justify-center mb-2">
                {teammate.handCards.map((card, i) => (
                  <TrucoCard
                    key={i}
                    number={card.number}
                    suit={card.suit as 'espada' | 'basto' | 'oro' | 'copa'}
                    isHidden={card.id === 'hidden'}
                    size="sm"
                  />
                ))}
              </div>
              <Badge className={`${teammate.team === 'A' ? 'bg-equipoA-bg text-equipoA border-equipoA-border' : 'bg-equipoB-bg text-equipoB border-equipoB-border'}`}>
                {teammate.name}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* My hand */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex gap-3 justify-center mb-4">
          {myPlayer.handCards.map((card) => (
            <TrucoCard
              key={card.id}
              number={card.number}
              suit={card.suit as 'espada' | 'basto' | 'oro' | 'copa'}
              isSelected={selectedCard === card.id}
              isPlayable={isMyTurn && hand?.canPlayCard}
              onClick={() => isMyTurn && hand?.canPlayCard && setSelectedCard(card.id)}
              size="lg"
            />
          ))}
        </div>
        
        {/* Play button */}
        {selectedCard && isMyTurn && hand?.canPlayCard && (
          <div className="text-center mb-3">
            <Button onClick={handlePlayCard} className="btn-pano px-10 animate-scale-in">
              Jugar carta
            </Button>
          </div>
        )}
        
        <div className="text-center">
          <Badge className={`${myPlayer.team === 'A' ? 'bg-equipoA-bg text-equipoA border-equipoA-border' : 'bg-equipoB-bg text-equipoB border-equipoB-border'} px-4`}>
            {myPlayer.name}
            {myPlayer.envidoValue > 0 && ` • ${myPlayer.envidoValue} tantos`}
          </Badge>
        </div>
      </div>

      {/* Fold button */}
      <div className="absolute bottom-4 left-4 z-10">
        <Button
          onClick={handleFold}
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-club"
        >
          <Flag className="w-4 h-4 mr-1" />
          Mazo
        </Button>
      </div>

      {/* Match log */}
      <div className="absolute top-32 right-4 z-10 w-56">
        <div className="bg-noche/80 border border-paño/30 rounded-club p-2">
          <p className="text-[10px] text-naipe-500 uppercase tracking-wide mb-2">Historial</p>
          <ScrollArea className="h-40">
            <div className="space-y-1">
              {gameState.log.slice(-12).reverse().map(entry => (
                <div key={entry.id} className="text-xs text-naipe-300">
                  {formatLogEntry(entry)}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Canto buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        {canCallTruco && !waitingForMe && (
          <Button 
            onClick={handleTruco} 
            className="bg-oro hover:bg-oro-dark text-noche font-bold rounded-club shadow-glow-oro"
          >
            {gameState.truco.level === 0 ? 'TRUCO' : 
             gameState.truco.level === 1 ? 'RETRUCO' : 'VALE 4'}
          </Button>
        )}
        
        {canCallEnvido && !waitingForMe && (
          <div className="flex flex-col gap-1">
            <Button 
              onClick={() => handleEnvido('ENVIDO')} 
              size="sm" 
              className="bg-celeste hover:bg-celeste-dark text-noche font-bold rounded-club"
            >
              Envido
            </Button>
            <Button 
              onClick={() => handleEnvido('REAL_ENVIDO')} 
              size="sm" 
              className="bg-celeste-dark hover:bg-celeste text-naipe font-bold rounded-club"
            >
              Real Envido
            </Button>
            <Button 
              onClick={() => handleEnvido('FALTA_ENVIDO')} 
              size="sm" 
              className="bg-noche hover:bg-noche-100 text-celeste border border-celeste/30 font-bold rounded-club"
            >
              Falta Envido
            </Button>
          </div>
        )}
        
        {canCallFlor && !waitingForMe && (
          <Button 
            onClick={handleFlor} 
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-club"
          >
            🌸 FLOR
          </Button>
        )}
      </div>

      {/* Response dialogs */}
      {waitingForMe && gameState.pendingCall?.type === 'TRUCO' && (
        <Dialog open={true}>
          <DialogContent className="bg-noche-100 border-oro/30 max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-oro text-2xl text-center font-bold">
                ¡{TRUCO_LEVELS[gameState.truco.level + 1]}!
              </DialogTitle>
              <DialogDescription className="text-naipe-400 text-center">
                ¿Querés o no querés?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3 sm:justify-center">
              <Button 
                onClick={() => handleRespondTruco('reject')} 
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-club flex-1"
              >
                No quiero
              </Button>
              <Button 
                onClick={() => handleRespondTruco('accept')} 
                className="btn-oro flex-1"
              >
                ¡Quiero!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {waitingForMe && gameState.pendingCall?.type === 'ENVIDO' && (
        <Dialog open={true}>
          <DialogContent className="bg-noche-100 border-celeste/30 max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-celeste text-2xl text-center font-bold">
                ¡{ENVIDO_CALLS[gameState.pendingCall?.subtype || 'ENVIDO'] || 'ENVIDO'}!
              </DialogTitle>
              <DialogDescription className="text-naipe-400 text-center">
                Tenés <span className="text-naipe font-bold">{myPlayer.envidoValue} tantos</span>. ¿Querés?
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => handleEnvido('ENVIDO')}
                size="sm"
                variant="outline"
                className="border-celeste/30 text-celeste hover:bg-celeste/10 rounded-club"
                disabled={!canRaiseEnvido('ENVIDO')}
              >
                Envido
              </Button>
              <Button
                onClick={() => handleEnvido('REAL_ENVIDO')}
                size="sm"
                variant="outline"
                className="border-celeste/30 text-celeste hover:bg-celeste/10 rounded-club"
                disabled={!canRaiseEnvido('REAL_ENVIDO')}
              >
                Real
              </Button>
              <Button
                onClick={() => handleEnvido('FALTA_ENVIDO')}
                size="sm"
                variant="outline"
                className="border-celeste/30 text-celeste hover:bg-celeste/10 rounded-club"
                disabled={!canRaiseEnvido('FALTA_ENVIDO')}
              >
                Falta
              </Button>
            </div>
            <DialogFooter className="flex gap-3 sm:justify-center">
              <Button 
                onClick={() => handleRespondEnvido('reject')} 
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-club flex-1"
              >
                No quiero
              </Button>
              <Button 
                onClick={() => handleRespondEnvido('accept')} 
                className="bg-celeste hover:bg-celeste-dark text-noche font-bold rounded-club flex-1"
              >
                ¡Quiero!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {waitingForMe && gameState.pendingCall?.type === 'FLOR' && (
        <Dialog open={true}>
          <DialogContent className="bg-noche-100 border-rose-300/30 max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-rose-400 text-2xl text-center font-bold">
                ¡FLOR!
              </DialogTitle>
              <DialogDescription className="text-naipe-400 text-center">
                ¿Querés o no querés?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3 sm:justify-center">
              <Button 
                onClick={() => handleRespondFlor('reject')} 
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-club flex-1"
              >
                No quiero
              </Button>
              <Button 
                onClick={() => handleRespondFlor('accept')} 
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-club flex-1"
              >
                ¡Quiero!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Game result dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="bg-noche-100 border-paño/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className={`text-3xl text-center font-bold ${gameState.winnerTeam === myPlayer.team ? 'text-oro' : 'text-naipe-600'}`}>
              {gameState.winnerTeam === myPlayer.team ? '🎉 ¡GANASTE!' : '😔 Perdiste'}
            </DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <p className="text-naipe-400">
                Equipo {gameState.winnerTeam} ganó la partida
              </p>
              <div className="tanteador inline-flex">
                <span className="text-equipoA font-bold text-2xl">{gameState.score.teamA}</span>
                <span className="text-naipe-700 mx-2">-</span>
                <span className="text-equipoB font-bold text-2xl">{gameState.score.teamB}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button 
              onClick={() => router.push('/jugar')} 
              className={gameState.winnerTeam === myPlayer.team ? 'btn-oro' : 'btn-pano'}
            >
              Volver a jugar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
