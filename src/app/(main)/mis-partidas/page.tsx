'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  History, 
  Trophy,
  XCircle,
  Clock,
  Users,
  Coins,
  ChevronRight,
  Gamepad2,
  Filter
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

interface GameHistory {
  id: string
  mode: string
  status: string
  stakeMode: string
  winnerTeam: string | null
  myTeam: string
  createdAt: string
  finishedAt: string | null
  result: 'WIN' | 'LOSS' | 'IN_PROGRESS' | 'CANCELLED'
  creditsChange?: number
  players: {
    username: string
    team: string
  }[]
}

const modeLabels: Record<string, string> = {
  ONE_VS_ONE: '1 vs 1',
  TWO_VS_TWO: '2 vs 2',
  THREE_VS_THREE: '3 vs 3',
}

const statusConfig: Record<string, { label: string; color: string }> = {
  WIN: { label: 'Victoria', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  LOSS: { label: 'Derrota', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  IN_PROGRESS: { label: 'En Juego', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  CANCELLED: { label: 'Cancelada', color: 'text-slate-400 bg-slate-400/10 border-slate-400/30' },
}

export default function MisPartidasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [games, setGames] = useState<GameHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/mis-partidas')
      return
    }
    
    if (status === 'authenticated') {
      fetchGames()
    }
  }, [status, router])

  const fetchGames = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/profile/games')
      const data = await res.json()
      if (res.ok) {
        setGames(data.games)
      }
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredGames = filter === 'ALL' 
    ? games 
    : games.filter(g => g.result === filter)

  const stats = {
    total: games.length,
    wins: games.filter(g => g.result === 'WIN').length,
    losses: games.filter(g => g.result === 'LOSS').length,
    inProgress: games.filter(g => g.result === 'IN_PROGRESS').length,
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <History className="w-8 h-8 text-purple-400" />
            Mis Partidas
          </h1>
          <p className="text-slate-400">Historial de todas tus partidas</p>
        </div>
        
        <Link href="/jugar">
          <Button className="bg-gradient-to-r from-amber-500 to-orange-600">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Nueva Partida
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Victorias</p>
              <p className="text-xl font-bold text-green-400">{stats.wins}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Derrotas</p>
              <p className="text-xl font-bold text-red-400">{stats.losses}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">En Juego</p>
              <p className="text-xl font-bold text-amber-400">{stats.inProgress}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Games List */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Historial</CardTitle>
            <CardDescription className="text-slate-400">
              {filteredGames.length} partidas
            </CardDescription>
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="WIN">Victorias</SelectItem>
              <SelectItem value="LOSS">Derrotas</SelectItem>
              <SelectItem value="IN_PROGRESS">En juego</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">No hay partidas</p>
              <p className="text-sm text-slate-600 mt-1">
                {filter !== 'ALL' ? 'Probá cambiando el filtro' : '¡Jugá tu primera partida!'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {filteredGames.map((game) => {
                  const resultConfig = statusConfig[game.result]
                  
                  return (
                    <div 
                      key={game.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                    >
                      {/* Result Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        game.result === 'WIN' ? 'bg-green-500/20' :
                        game.result === 'LOSS' ? 'bg-red-500/20' :
                        game.result === 'IN_PROGRESS' ? 'bg-blue-500/20' :
                        'bg-slate-500/20'
                      }`}>
                        {game.result === 'WIN' ? <Trophy className="w-6 h-6 text-green-400" /> :
                         game.result === 'LOSS' ? <XCircle className="w-6 h-6 text-red-400" /> :
                         game.result === 'IN_PROGRESS' ? <Clock className="w-6 h-6 text-blue-400" /> :
                         <XCircle className="w-6 h-6 text-slate-400" />}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">
                            {modeLabels[game.mode] || game.mode}
                          </span>
                          <Badge variant="outline" className={resultConfig.color}>
                            {resultConfig.label}
                          </Badge>
                          {game.stakeMode !== 'NONE' && (
                            <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
                              <Coins className="w-3 h-3 mr-1" />
                              Stake
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Equipo {game.myTeam}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(game.createdAt).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Credits Change */}
                      {game.creditsChange !== undefined && game.creditsChange !== 0 && (
                        <div className={`text-lg font-bold ${game.creditsChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {game.creditsChange > 0 ? '+' : ''}{game.creditsChange}
                        </div>
                      )}
                      
                      {/* Action */}
                      {game.result === 'IN_PROGRESS' && (
                        <Link href={`/table/${game.id}`}>
                          <Button size="sm" className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                            Continuar
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

