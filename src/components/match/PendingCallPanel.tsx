import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CallType = 'TRUCO' | 'ENVIDO' | 'FLOR'
type PendingCall = {
  type: CallType
  subtype: string
  fromPlayerId: string
  toPlayerId: string
}

interface PlayerInfo {
  playerId: string
  name: string
}

interface PendingCallPanelProps {
  pendingCall: PendingCall | null
  players: PlayerInfo[]
  currentPlayerId: string
  canRaiseTruco: boolean
  canRaiseEnvido: (call: string) => boolean
  onAccept: () => void
  onReject: () => void
  onRaiseTruco: () => void
  onRaiseEnvido: (call: string) => void
}

const callTitles: Record<CallType, string> = {
  TRUCO: 'TRUCO',
  ENVIDO: 'ENVIDO',
  FLOR: 'FLOR',
}

export function PendingCallPanel({
  pendingCall,
  players,
  currentPlayerId,
  canRaiseTruco,
  canRaiseEnvido,
  onAccept,
  onReject,
  onRaiseTruco,
  onRaiseEnvido,
}: PendingCallPanelProps) {
  if (!pendingCall) return null
  if (pendingCall.toPlayerId !== currentPlayerId) return null

  const caller = players.find(p => p.playerId === pendingCall.fromPlayerId)?.name ?? 'Rival'
  const title = callTitles[pendingCall.type]

  return (
    <div className="w-full max-w-xl mx-auto mt-3 rounded-xl border border-paño/40 bg-noche/80 px-4 py-3">
      <p className="text-sm text-naipe-200 font-semibold mb-2">
        Te cantaron <span className="text-oro font-bold">{title}</span> — {caller}
      </p>
      <div className={cn('flex flex-wrap gap-2 justify-center')}>
        <Button onClick={onAccept} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-club">
          QUIERO
        </Button>
        <Button onClick={onReject} className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-club">
          NO QUIERO
        </Button>
        {pendingCall.type === 'TRUCO' && (
          <Button
            onClick={onRaiseTruco}
            disabled={!canRaiseTruco}
            className="bg-oro hover:bg-oro-dark text-noche font-bold rounded-club"
          >
            {pendingCall.subtype === 'TRUCO' ? 'RETRUCO' : 'VALE 4'}
          </Button>
        )}
        {pendingCall.type === 'ENVIDO' && (
          <>
            <Button
              onClick={() => onRaiseEnvido('ENVIDO')}
              disabled={!canRaiseEnvido('ENVIDO')}
              className="bg-celeste hover:bg-celeste-dark text-noche font-bold rounded-club"
            >
              ENVIDO
            </Button>
            <Button
              onClick={() => onRaiseEnvido('REAL_ENVIDO')}
              disabled={!canRaiseEnvido('REAL_ENVIDO')}
              className="bg-celeste-dark hover:bg-celeste text-naipe font-bold rounded-club"
            >
              REAL
            </Button>
            <Button
              onClick={() => onRaiseEnvido('FALTA_ENVIDO')}
              disabled={!canRaiseEnvido('FALTA_ENVIDO')}
              className="bg-noche hover:bg-noche-100 text-celeste border border-celeste/30 font-bold rounded-club"
            >
              FALTA
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
