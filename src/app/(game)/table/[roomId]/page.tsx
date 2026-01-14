'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

// Componentes del juego rediseñados
import { TableBackground } from '@/components/game/TableBackground'
import { SideHUD } from '@/components/game/SideHUD'
import { PlayedCardsSlots } from '@/components/game/PlayedCardsSlots'
import { PlayerHandFan } from '@/components/game/PlayerHandFan'
import { ActionButtonsBar } from '@/components/game/ActionButtonsBar'
import { OpponentDisplay, TeammateDisplay } from '@/components/game/OpponentDisplay'
import { TrucoLevelBadge } from '@/components/game/AnnouncementBanner'
import { ResponseDialog, GameResultDialog } from '@/components/game/ResponseDialog'

import { connectSocket, getSocket, type GameStateView } from '@/lib/socket/client'

const ENVIDO_CALLS: Record<string, string> = {
  envido: 'ENVIDO',
  real_envido: 'REAL ENVIDO',
  falta_envido: 'FALTA ENVIDO',
  envido_envido: 'ENVIDO ENVIDO',
}

const TRUCO_LEVELS = ['TRUCO', 'RETRUCO', 'VALE 4']

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

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <TableBackground>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              <span className="text-5xl animate-bounce">🃏</span>
            </div>
            <p className="text-white/60 text-lg font-medium">Cargando partida...</p>
            <div className="flex justify-center gap-1 mt-4">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </TableBackground>
    )
  }

  // Error state
  if (!gameState || !myPlayer) {
    return (
      <TableBackground>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center p-8 rounded-3xl bg-black/40 backdrop-blur-sm border border-white/10">
            <p className="text-white/60 text-lg mb-6">Error al cargar la partida</p>
            <button 
              onClick={() => router.push('/jugar')} 
              className="px-8 py-3 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white font-bold shadow-lg"
            >
              Volver
            </button>
          </div>
        </div>
      </TableBackground>
    )
  }

  const round = gameState.currentRound
  const opponents = gameState.players.filter(p => p.team !== myPlayer.team)
  const teammates = gameState.players.filter(p => p.team === myPlayer.team && p.oderId !== myPlayer.oderId)

  // Condiciones para acciones
  const canCallEnvido = round && round.currentBazaIndex === 0 && 
    round.bazas[0].cardA === null && round.bazas[0].cardB === null &&
    !round.trucoState.accepted && !round.envidoState.resolved

  const canCallTruco = round && round.trucoState.level < 3 && !round.waitingForResponse

  const canCallFlor = round && round.florState.enabled && 
    myPlayer.hasFlor && round.currentBazaIndex === 0

  // Preparar cartas para PlayerHandFan
  const myCards = myPlayer.cards.map(card => ({
    id: card.id,
    number: card.number,
    suit: card.suit as 'espada' | 'basto' | 'oro' | 'copa',
  }))

  // Preparar bazas para PlayedCardsSlots
  const bazasForSlots = (round?.bazas || []).map(baza => ({
    cardA: baza.cardA ? { 
      number: baza.cardA.number, 
      suit: baza.cardA.suit as 'espada' | 'basto' | 'oro' | 'copa' 
    } : null,
    cardB: baza.cardB ? { 
      number: baza.cardB.number, 
      suit: baza.cardB.suit as 'espada' | 'basto' | 'oro' | 'copa' 
    } : null,
    winner: baza.winner,
  }))

  return (
    <TableBackground>
      {/* HUD lateral izquierdo */}
      <SideHUD
        scoreA={gameState.scoreA}
        scoreB={gameState.scoreB}
        targetScore={gameState.targetScore}
        myTeam={myPlayer.team}
        currentBaza={round?.currentBazaIndex || 0}
        isMuted={isMuted}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onExit={() => router.push('/jugar')}
      />

      {/* Badge de nivel de truco (si está activo) */}
      {round && round.trucoState.level > 0 && round.trucoState.accepted && (
        <TrucoLevelBadge level={round.trucoState.level} />
      )}

      {/* Oponentes arriba */}
      <OpponentDisplay 
        opponents={opponents}
        currentTurn={round?.currentTurn}
        myTeam={myPlayer.team}
      />

      {/* Zona central - cartas jugadas */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <PlayedCardsSlots
          bazas={bazasForSlots}
          currentBazaIndex={round?.currentBazaIndex || 0}
          myTeam={myPlayer.team}
        />
      </div>

      {/* Compañeros de equipo (2v2, 3v3) */}
      <TeammateDisplay 
        teammates={teammates}
        currentTurn={round?.currentTurn}
      />

      {/* Mi mano de cartas */}
      <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-20">
        <PlayerHandFan
          cards={myCards}
          selectedCard={selectedCard}
          onSelectCard={setSelectedCard}
          isMyTurn={isMyTurn || false}
          canPlayCard={round?.canPlayCard || false}
          onPlayCard={handlePlayCard}
        />
        
        {/* Mi nombre/info */}
        <div className="flex justify-center mt-4">
          <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <span className="text-white/80 font-semibold text-sm">
              {myPlayer.odername}
              {myPlayer.envidoPoints > 0 && (
                <span className="text-cyan-400 ml-2">
                  • {myPlayer.envidoPoints} tantos
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <ActionButtonsBar
        canCallTruco={Boolean(canCallTruco && !waitingForMe)}
        trucoLevel={round?.trucoState.level || 0}
        onCallTruco={handleTruco}
        canCallEnvido={Boolean(canCallEnvido && !waitingForMe)}
        onCallEnvido={handleEnvido}
        canCallFlor={Boolean(canCallFlor && !waitingForMe)}
        onCallFlor={handleFlor}
        florEnabled={round?.florState.enabled || false}
        onFold={handleFold}
        waitingForResponse={waitingForMe || false}
      />

      {/* Dialog de respuesta a Truco */}
      <ResponseDialog
        type="truco"
        message={TRUCO_LEVELS[round?.trucoState.level || 0]}
        subMessage="Te cantaron"
        show={Boolean(waitingForMe && round?.trucoState.pendingCall)}
        onAccept={() => handleRespondTruco('accept')}
        onReject={() => handleRespondTruco('reject')}
      />

      {/* Dialog de respuesta a Envido */}
      <ResponseDialog
        type="envido"
        message={ENVIDO_CALLS[round?.envidoState.pendingCall || ''] || 'ENVIDO'}
        subMessage={`Tenés ${myPlayer.envidoPoints} tantos`}
        show={Boolean(waitingForMe && round?.envidoState.pendingCall)}
        onAccept={() => handleRespondEnvido('accept')}
        onReject={() => handleRespondEnvido('reject')}
      />

      {/* Dialog de resultado */}
      <GameResultDialog
        show={showResult}
        isWinner={gameState.winner === myPlayer.team}
        scoreA={gameState.scoreA}
        scoreB={gameState.scoreB}
        myTeam={myPlayer.team}
        winnerTeam={gameState.winner}
        onClose={() => router.push('/jugar')}
      />
    </TableBackground>
  )
}
