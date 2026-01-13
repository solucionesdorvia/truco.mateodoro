'use client'

import { useEffect, useState } from 'react'
import { 
  Trophy, 
  Medal,
  Clock,
  Users,
  Target,
  Percent,
  Coins,
  Crown,
  ChevronUp,
  ChevronDown,
  Minus
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PlayerRanking {
  position: number
  userId: string
  username: string
  gamesPlayed: number
  gamesWon: number
  winRate: number
  creditsWon: number
  trend?: 'up' | 'down' | 'same'
}

interface RankingsData {
  weekly: PlayerRanking[]
  global: PlayerRanking[]
  weekEndDate: string
}

function getWeekEndDate() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  const sunday = new Date(now)
  sunday.setDate(now.getDate() + daysUntilSunday)
  sunday.setHours(23, 59, 59, 999)
  return sunday
}

function getCountdown(endDate: Date) {
  const now = new Date()
  const diff = endDate.getTime() - now.getTime()
  
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return { days, hours, minutes }
}

export default function RankingsPage() {
  const [data, setData] = useState<RankingsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [countdown, setCountdown] = useState(getCountdown(getWeekEndDate()))

  useEffect(() => {
    fetchRankings()
    
    // Update countdown every minute
    const interval = setInterval(() => {
      setCountdown(getCountdown(getWeekEndDate()))
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchRankings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/rankings')
      const result = await res.json()
      if (res.ok) {
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching rankings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderPositionBadge = (position: number) => {
    if (position === 1) return <span className="text-2xl">🥇</span>
    if (position === 2) return <span className="text-2xl">🥈</span>
    if (position === 3) return <span className="text-2xl">🥉</span>
    return (
      <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">
        {position}
      </span>
    )
  }

  const renderTrend = (trend?: 'up' | 'down' | 'same') => {
    if (trend === 'up') return <ChevronUp className="w-4 h-4 text-green-400" />
    if (trend === 'down') return <ChevronDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-slate-600" />
  }

  const renderLeaderboard = (players: PlayerRanking[], isWeekly: boolean) => {
    if (players.length === 0) {
      return (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">No hay datos de ranking todavía</p>
          <p className="text-sm text-slate-600 mt-1">¡Jugá partidas para aparecer!</p>
        </div>
      )
    }

    // Top 3
    const top3 = players.slice(0, 3)
    const rest = players.slice(3)

    return (
      <div className="space-y-6">
        {/* Top 3 Cards */}
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd Place */}
          {top3[1] ? (
            <Card className="bg-gradient-to-br from-slate-400/10 to-slate-500/5 border-slate-600/30 order-1">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-2 block">🥈</span>
                <p className="font-semibold text-white truncate">{top3[1].username}</p>
                <p className="text-2xl font-bold text-amber-400 my-2">{top3[1].gamesWon}</p>
                <p className="text-xs text-slate-500">victorias</p>
                <Badge variant="outline" className="mt-2 text-xs border-slate-700">
                  {top3[1].winRate}% WR
                </Badge>
              </CardContent>
            </Card>
          ) : <div className="order-1" />}
          
          {/* 1st Place */}
          {top3[0] ? (
            <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/30 order-2 transform scale-105">
              <CardContent className="p-4 text-center">
                <Crown className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <span className="text-4xl mb-2 block">🥇</span>
                <p className="font-bold text-white truncate text-lg">{top3[0].username}</p>
                <p className="text-3xl font-bold text-amber-400 my-2">{top3[0].gamesWon}</p>
                <p className="text-xs text-slate-500">victorias</p>
                <Badge className="mt-2 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  {top3[0].winRate}% WR
                </Badge>
              </CardContent>
            </Card>
          ) : <div className="order-2" />}
          
          {/* 3rd Place */}
          {top3[2] ? (
            <Card className="bg-gradient-to-br from-orange-700/10 to-orange-800/5 border-orange-700/30 order-3">
              <CardContent className="p-4 text-center">
                <span className="text-3xl mb-2 block">🥉</span>
                <p className="font-semibold text-white truncate">{top3[2].username}</p>
                <p className="text-2xl font-bold text-amber-400 my-2">{top3[2].gamesWon}</p>
                <p className="text-xs text-slate-500">victorias</p>
                <Badge variant="outline" className="mt-2 text-xs border-slate-700">
                  {top3[2].winRate}% WR
                </Badge>
              </CardContent>
            </Card>
          ) : <div className="order-3" />}
        </div>

        {/* Rest of leaderboard */}
        {rest.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-slate-800">
                  {rest.map((player) => (
                    <div 
                      key={player.userId}
                      className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 w-12">
                        {renderPositionBadge(player.position)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{player.username}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {player.gamesPlayed} jugadas
                          </span>
                          <span className="flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            {player.winRate}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-400">{player.gamesWon}</p>
                        <p className="text-xs text-slate-500">victorias</p>
                      </div>
                      
                      <div className="w-6">
                        {renderTrend(player.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            Rankings
          </h1>
          <p className="text-slate-400">Los mejores jugadores de Truco Argentino</p>
        </div>
        
        {/* Weekly Countdown */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <Clock className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-xs text-slate-500 mb-1">Ranking semanal termina en</p>
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{countdown.days}</p>
                  <p className="text-[10px] text-slate-500">días</p>
                </div>
                <span className="text-slate-600">:</span>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{countdown.hours}</p>
                  <p className="text-[10px] text-slate-500">hs</p>
                </div>
                <span className="text-slate-600">:</span>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{countdown.minutes}</p>
                  <p className="text-[10px] text-slate-500">min</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Jugadores</p>
                <p className="text-xl font-bold text-white">{data.global.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Líder Global</p>
                <p className="text-lg font-bold text-white truncate">
                  {data.global[0]?.username || '-'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Medal className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Líder Semanal</p>
                <p className="text-lg font-bold text-white truncate">
                  {data.weekly[0]?.username || '-'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Top Ganancias</p>
                <p className="text-xl font-bold text-green-400">
                  +{data.global[0]?.creditsWon || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="weekly" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Clock className="w-4 h-4 mr-2" />
            Semanal
          </TabsTrigger>
          <TabsTrigger value="global" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Trophy className="w-4 h-4 mr-2" />
            Global
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}
              </div>
              <Skeleton className="h-64" />
            </div>
          ) : (
            renderLeaderboard(data?.weekly || [], true)
          )}
        </TabsContent>

        <TabsContent value="global">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}
              </div>
              <Skeleton className="h-64" />
            </div>
          ) : (
            renderLeaderboard(data?.global || [], false)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

