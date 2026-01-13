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

const TRUCO_LEVELS = ['', 'TRUCO', 'RETRUCO', 'VALE 4']
const ENVIDO_CALLS: Record<string, string> = {
  envido: 'ENVIDO',
  real_envido: 'REAL ENVIDO',
  falta_envido: 'FALTA ENVIDO',
  envido_envido: 'ENVIDO ENVIDO',
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

  const myPlayer = gameState?.players.find(p => p.oderId === session?.user?.id)
  const isMyTurn = gameState?.currentRound?.currentTurn === session?.user?.id
  const waitingForMe = gameState?.currentRound?.waitingForResponse === session?.user?.id

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

  const handleFold = useCallback(() => {
    const socket = getSocket()
    socket.emit('game:fold', { roomId })
  }, [roomId])

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

  const round = gameState.currentRound
  const opponents = gameState.players.filter(p => p.team !== myPlayer.team)
  const teammates = gameState.players.filter(p => p.team === myPlayer.team && p.oderId !== myPlayer.oderId)

  // Can call envido?
  const canCallEnvido = round && round.currentBazaIndex === 0 && 
    round.bazas[0].cardA === null && round.bazas[0].cardB === null &&
    !round.trucoState.accepted && !round.envidoState.resolved

  // Can call truco?
  const canCallTruco = round && round.trucoState.level < 3 && !round.waitingForResponse

  // Can call flor?
  const canCallFlor = round && round.florState.enabled && 
    myPlayer.hasFlor && round.currentBazaIndex === 0

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
              <p className="tanteador-score text-equipoA">{gameState.scoreA}</p>
            </div>
            <div className="text-naipe-700 text-xl">-</div>
            <div className="text-center">
              <p className="text-[10px] text-equipoB font-bold uppercase tracking-wide">B</p>
              <p className="tanteador-score text-equipoB">{gameState.scoreB}</p>
            </div>
          </div>
          
          <Badge className="bg-noche/80 text-naipe-400 border-paño/30">
            A {gameState.targetScore}
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
      {round && round.trucoState.level > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-oro text-noche text-lg px-6 py-1.5 font-bold tracking-wide animate-pulse shadow-glow-oro">
            {TRUCO_LEVELS[round.trucoState.level]}
          </Badge>
        </div>
      )}

      {/* Turn indicator */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10">
        <Badge className={`${isMyTurn ? 'bg-paño text-naipe animate-pulse' : 'bg-noche/80 text-naipe-600'} px-4 py-1`}>
          {isMyTurn ? '¡Tu turno!' : `Turno de ${gameState.players.find(p => p.oderId === round?.currentTurn)?.odername || '...'}`}
        </Badge>
      </div>

      {/* Opponents (top) */}
      <div className="absolute top-36 left-1/2 -translate-x-1/2 flex gap-12">
        {opponents.map((opponent) => (
          <div key={opponent.oderId} className="text-center">
            <Badge className={`mb-2 ${opponent.team === 'A' ? 'bg-equipoA-bg text-equipoA border-equipoA-border' : 'bg-equipoB-bg text-equipoB border-equipoB-border'}`}>
              {opponent.odername}
            </Badge>
            <div className="flex gap-1 justify-center">
              {opponent.cards.map((card, i) => (
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
                {round?.bazas.map((baza, i) => (
                  baza.cardA && (
                    <TrucoCard
                      key={i}
                      number={baza.cardA.number}
                      suit={baza.cardA.suit as 'espada' | 'basto' | 'oro' | 'copa'}
                      size="md"
                    />
                  )
                ))}
              </div>
            </div>
            
            {/* VS divider */}
            <div className="text-3xl text-naipe-700/50 font-bold">VS</div>
            
            {/* Team B played cards */}
            <div className="text-center">
              <p className="text-equipoB text-xs font-semibold mb-2 uppercase tracking-wide">Equipo B</p>
              <div className="flex gap-2">
                {round?.bazas.map((baza, i) => (
                  baza.cardB && (
                    <TrucoCard
                      key={i}
                      number={baza.cardB.number}
                      suit={baza.cardB.suit as 'espada' | 'basto' | 'oro' | 'copa'}
                      size="md"
                    />
                  )
                ))}
              </div>
            </div>
          </div>
          
          {/* Baza indicators */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1, 2].map((bazaIdx) => {
              const baza = round?.bazas[bazaIdx]
              const winner = baza?.winner
              return (
                <div 
                  key={bazaIdx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    winner === 'A' ? 'bg-equipoA' :
                    winner === 'B' ? 'bg-equipoB' :
                    winner === 'DRAW' ? 'bg-naipe-600' :
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
                {teammate.cards.map((card, i) => (
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
                {teammate.odername}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* My hand */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex gap-3 justify-center mb-4">
          {myPlayer.cards.map((card) => (
            <TrucoCard
              key={card.id}
              number={card.number}
              suit={card.suit as 'espada' | 'basto' | 'oro' | 'copa'}
              isSelected={selectedCard === card.id}
              isPlayable={isMyTurn && round?.canPlayCard}
              onClick={() => isMyTurn && round?.canPlayCard && setSelectedCard(card.id)}
              size="lg"
            />
          ))}
        </div>
        
        {/* Play button */}
        {selectedCard && isMyTurn && round?.canPlayCard && (
          <div className="text-center mb-3">
            <Button onClick={handlePlayCard} className="btn-pano px-10 animate-scale-in">
              Jugar carta
            </Button>
          </div>
        )}
        
        <div className="text-center">
          <Badge className={`${myPlayer.team === 'A' ? 'bg-equipoA-bg text-equipoA border-equipoA-border' : 'bg-equipoB-bg text-equipoB border-equipoB-border'} px-4`}>
            {myPlayer.odername}
            {myPlayer.envidoPoints > 0 && ` • ${myPlayer.envidoPoints} tantos`}
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

      {/* Canto buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        {canCallTruco && !waitingForMe && (
          <Button 
            onClick={handleTruco} 
            className="bg-oro hover:bg-oro-dark text-noche font-bold rounded-club shadow-glow-oro"
          >
            {round?.trucoState.level === 0 ? 'TRUCO' : 
             round?.trucoState.level === 1 ? 'RETRUCO' : 'VALE 4'}
          </Button>
        )}
        
        {canCallEnvido && !waitingForMe && (
          <div className="flex flex-col gap-1">
            <Button 
              onClick={() => handleEnvido('envido')} 
              size="sm" 
              className="bg-celeste hover:bg-celeste-dark text-noche font-bold rounded-club"
            >
              Envido
            </Button>
            <Button 
              onClick={() => handleEnvido('real_envido')} 
              size="sm" 
              className="bg-celeste-dark hover:bg-celeste text-naipe font-bold rounded-club"
            >
              Real Envido
            </Button>
            <Button 
              onClick={() => handleEnvido('falta_envido')} 
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
      {waitingForMe && round?.trucoState.pendingCall && (
        <Dialog open={true}>
          <DialogContent className="bg-noche-100 border-oro/30 max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-oro text-2xl text-center font-bold">
                ¡{TRUCO_LEVELS[round.trucoState.level + 1]}!
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

      {waitingForMe && round?.envidoState.pendingCall && (
        <Dialog open={true}>
          <DialogContent className="bg-noche-100 border-celeste/30 max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-celeste text-2xl text-center font-bold">
                ¡{ENVIDO_CALLS[round.envidoState.pendingCall] || 'ENVIDO'}!
              </DialogTitle>
              <DialogDescription className="text-naipe-400 text-center">
                Tenés <span className="text-naipe font-bold">{myPlayer.envidoPoints} tantos</span>. ¿Querés?
              </DialogDescription>
            </DialogHeader>
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

      {/* Game result dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="bg-noche-100 border-paño/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className={`text-3xl text-center font-bold ${gameState.winner === myPlayer.team ? 'text-oro' : 'text-naipe-600'}`}>
              {gameState.winner === myPlayer.team ? '🎉 ¡GANASTE!' : '😔 Perdiste'}
            </DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <p className="text-naipe-400">
                Equipo {gameState.winner} ganó la partida
              </p>
              <div className="tanteador inline-flex">
                <span className="text-equipoA font-bold text-2xl">{gameState.scoreA}</span>
                <span className="text-naipe-700 mx-2">-</span>
                <span className="text-equipoB font-bold text-2xl">{gameState.scoreB}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button 
              onClick={() => router.push('/jugar')} 
              className={gameState.winner === myPlayer.team ? 'btn-oro' : 'btn-pano'}
            >
              Volver a jugar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
