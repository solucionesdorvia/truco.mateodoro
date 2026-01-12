'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

const TRUCO_LEVELS = ['', 'Truco', 'Retruco', 'Vale Cuatro']
const ENVIDO_CALLS = {
  envido: 'Envido',
  real_envido: 'Real Envido',
  falta_envido: 'Falta Envido',
  envido_envido: 'Envido Envido',
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
      toast.success(`¡Equipo ${winner} ganó la partida!`)
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
      <div className="min-h-screen table-felt flex items-center justify-center">
        <div className="text-white text-xl">Cargando partida...</div>
      </div>
    )
  }

  if (!gameState || !myPlayer) {
    return (
      <div className="min-h-screen table-felt flex items-center justify-center">
        <div className="text-white text-xl">Error al cargar la partida</div>
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
    <div className="min-h-screen table-felt relative overflow-hidden">
      {/* Scores */}
      <div className="absolute top-4 left-4 flex gap-4 z-10">
        <Card className="bg-blue-900/80 border-blue-600 px-4 py-2">
          <div className="text-center">
            <p className="text-blue-200 text-xs">Equipo A</p>
            <p className="text-3xl font-bold text-white">{gameState.scoreA}</p>
          </div>
        </Card>
        <Card className="bg-red-900/80 border-red-600 px-4 py-2">
          <div className="text-center">
            <p className="text-red-200 text-xs">Equipo B</p>
            <p className="text-3xl font-bold text-white">{gameState.scoreB}</p>
          </div>
        </Card>
      </div>

      {/* Target score */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className="bg-amber-600 text-white">
          A {gameState.targetScore} puntos
        </Badge>
      </div>

      {/* Truco status */}
      {round && round.trucoState.level > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-yellow-500 text-black text-lg px-4 py-1 animate-pulse-glow">
            {TRUCO_LEVELS[round.trucoState.level]}
          </Badge>
        </div>
      )}

      {/* Turn indicator */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
        <Badge variant="outline" className={`${isMyTurn ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'} text-sm`}>
          {isMyTurn ? '¡Tu turno!' : `Turno de ${gameState.players.find(p => p.oderId === round?.currentTurn)?.odername || '...'}`}
        </Badge>
      </div>

      {/* Opponents (top) */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 flex gap-8">
        {opponents.map((opponent) => (
          <div key={opponent.oderId} className="text-center">
            <div className="flex gap-1 justify-center mb-2">
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
            <Badge variant="outline" className={`${opponent.team === 'A' ? 'border-blue-500 text-blue-300' : 'border-red-500 text-red-300'}`}>
              {opponent.odername}
            </Badge>
          </div>
        ))}
      </div>

      {/* Center (played cards) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex gap-12 items-center">
          {/* Team A cards */}
          <div className="text-center">
            <p className="text-blue-300 text-sm mb-2">Equipo A</p>
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
          
          {/* VS */}
          <div className="text-4xl text-white/50">VS</div>
          
          {/* Team B cards */}
          <div className="text-center">
            <p className="text-red-300 text-sm mb-2">Equipo B</p>
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
      </div>

      {/* Teammates */}
      {teammates.length > 0 && (
        <div className="absolute bottom-48 left-1/2 -translate-x-1/2 flex gap-8">
          {teammates.map((teammate) => (
            <div key={teammate.oderId} className="text-center">
              <Badge variant="outline" className={`mb-2 ${teammate.team === 'A' ? 'border-blue-500 text-blue-300' : 'border-red-500 text-red-300'}`}>
                {teammate.odername}
              </Badge>
              <div className="flex gap-1 justify-center">
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
            </div>
          ))}
        </div>
      )}

      {/* My hand */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="flex gap-2 justify-center mb-4">
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
          <div className="text-center mb-2">
            <Button onClick={handlePlayCard} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
              Jugar Carta
            </Button>
          </div>
        )}
        
        <p className="text-center text-green-200">
          {myPlayer.odername} ({myPlayer.team === 'A' ? 'Equipo A' : 'Equipo B'})
          {myPlayer.envidoPoints > 0 && ` • Envido: ${myPlayer.envidoPoints}`}
        </p>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <Button
          onClick={handleFold}
          variant="destructive"
          size="sm"
          className="bg-red-700 hover:bg-red-800"
        >
          🏳️ Ir al Mazo
        </Button>
      </div>

      {/* Chant buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {canCallTruco && !waitingForMe && (
          <Button onClick={handleTruco} className="bg-yellow-600 hover:bg-yellow-700 text-white">
            {round?.trucoState.level === 0 ? '🃏 Truco' : 
             round?.trucoState.level === 1 ? '🃏 Retruco' : '🃏 Vale 4'}
          </Button>
        )}
        
        {canCallEnvido && !waitingForMe && (
          <div className="flex flex-col gap-1">
            <Button onClick={() => handleEnvido('envido')} size="sm" className="bg-purple-600 hover:bg-purple-700">
              Envido
            </Button>
            <Button onClick={() => handleEnvido('real_envido')} size="sm" className="bg-purple-700 hover:bg-purple-800">
              Real Envido
            </Button>
            <Button onClick={() => handleEnvido('falta_envido')} size="sm" className="bg-purple-800 hover:bg-purple-900">
              Falta Envido
            </Button>
          </div>
        )}
        
        {canCallFlor && !waitingForMe && (
          <Button onClick={handleFlor} className="bg-pink-600 hover:bg-pink-700 text-white">
            🌸 Flor
          </Button>
        )}
      </div>

      {/* Response dialogs */}
      {waitingForMe && round?.trucoState.pendingCall && (
        <Dialog open={true}>
          <DialogContent className="bg-green-900 border-green-700">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl">
                ¡Te cantaron {TRUCO_LEVELS[round.trucoState.level + 1]}!
              </DialogTitle>
              <DialogDescription className="text-green-200">
                ¿Querés aceptar?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button onClick={() => handleRespondTruco('reject')} variant="destructive">
                No Quiero
              </Button>
              <Button onClick={() => handleRespondTruco('accept')} className="bg-emerald-500 hover:bg-emerald-600">
                Quiero
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {waitingForMe && round?.envidoState.pendingCall && (
        <Dialog open={true}>
          <DialogContent className="bg-purple-900 border-purple-700">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl">
                ¡Te cantaron {ENVIDO_CALLS[round.envidoState.pendingCall as keyof typeof ENVIDO_CALLS]}!
              </DialogTitle>
              <DialogDescription className="text-purple-200">
                Tu envido: {myPlayer.envidoPoints} puntos. ¿Querés aceptar?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button onClick={() => handleRespondEnvido('reject')} variant="destructive">
                No Quiero
              </Button>
              <Button onClick={() => handleRespondEnvido('accept')} className="bg-purple-500 hover:bg-purple-600">
                Quiero
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Game result dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="bg-gradient-to-br from-amber-800 to-amber-900 border-amber-600">
          <DialogHeader>
            <DialogTitle className="text-white text-3xl text-center">
              {gameState.winner === myPlayer.team ? '🎉 ¡Ganaste!' : '😢 Perdiste'}
            </DialogTitle>
            <DialogDescription className="text-amber-200 text-center text-lg">
              Equipo {gameState.winner} ganó la partida
              <br />
              Puntuación final: {gameState.scoreA} - {gameState.scoreB}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-center">
            <Button onClick={() => router.push('/')} className="bg-amber-500 hover:bg-amber-600 text-black">
              Volver al Inicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

