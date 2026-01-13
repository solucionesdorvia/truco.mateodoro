'use client'

import { useEffect, useState } from 'react'
import { 
  Trophy, 
  Medal,
  Clock,
  Users,
  Target,
  Coins,
  Crown,
  ChevronUp,
  ChevronDown,
  Minus,
  Flame,
  Timer
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
  streak?: number
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

  const renderTrend = (trend?: 'up' | 'down' | 'same') => {
    if (trend === 'up') return <ChevronUp className="w-4 h-4 text-paño-50" />
    if (trend === 'down') return <ChevronDown className="w-4 h-4 text-destructive" />
    return <Minus className="w-4 h-4 text-naipe-700" />
  }

  const renderLeaderboard = (players: PlayerRanking[], isWeekly: boolean) => {
    if (players.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-noche-200 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-naipe-700" />
          </div>
          <p className="text-naipe-400 mb-2">Sin datos de ranking todavía</p>
          <p className="text-sm text-naipe-700">¡Jugá partidas para aparecer en la tabla!</p>
        </div>
      )
    }

    // Top 3 (Podio)
    const top3 = players.slice(0, 3)
    const rest = players.slice(3)

    return (
      <div className="space-y-8">
        {/* Podio */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mx-auto">
          {/* 2nd Place */}
          <div className="order-1">
            {top3[1] && (
              <div className="card-club p-4 sm:p-6 text-center border-naipe-600/30 bg-gradient-to-b from-naipe-600/10 to-transparent">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-naipe-600/20 border-2 border-naipe-600/40 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl sm:text-3xl font-bold text-naipe-500">2</span>
                </div>
                <p className="font-bold text-naipe truncate text-sm sm:text-base">{top3[1].username}</p>
                <p className="text-2xl sm:text-3xl font-bold text-oro my-2 tabular-nums">{top3[1].gamesWon}</p>
                <p className="text-xs text-naipe-700">victorias</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge className="bg-noche-200 text-naipe-400 border-none text-[10px]">
                    {top3[1].winRate}% WR
                  </Badge>
                  {top3[1].streak && top3[1].streak > 0 && (
                    <Badge className="bg-oro/20 text-oro border-none text-[10px]">
                      <Flame className="w-2 h-2 mr-0.5" />
                      {top3[1].streak}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* 1st Place */}
          <div className="order-2">
            {top3[0] && (
              <div className="card-club p-4 sm:p-6 text-center border-oro/40 bg-gradient-to-b from-oro/20 to-transparent relative scale-105 sm:scale-110">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-oro mx-auto mb-2 absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2" />
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-oro/20 border-2 border-oro/50 flex items-center justify-center mx-auto mb-3 mt-2">
                  <span className="text-3xl sm:text-4xl font-bold text-oro">1</span>
                </div>
                <p className="font-bold text-naipe truncate sm:text-lg">{top3[0].username}</p>
                <p className="text-3xl sm:text-4xl font-bold text-oro my-2 tabular-nums">{top3[0].gamesWon}</p>
                <p className="text-xs text-naipe-700">victorias</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge className="bg-oro/20 text-oro border-none text-xs">
                    {top3[0].winRate}% WR
                  </Badge>
                  {top3[0].streak && top3[0].streak > 0 && (
                    <Badge className="bg-oro/30 text-oro border-none text-xs">
                      <Flame className="w-3 h-3 mr-0.5" />
                      {top3[0].streak}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* 3rd Place */}
          <div className="order-3">
            {top3[2] && (
              <div className="card-club p-4 sm:p-6 text-center border-oro-muted/30 bg-gradient-to-b from-oro-muted/10 to-transparent">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-oro-muted/20 border-2 border-oro-muted/40 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl sm:text-3xl font-bold text-oro-muted">3</span>
                </div>
                <p className="font-bold text-naipe truncate text-sm sm:text-base">{top3[2].username}</p>
                <p className="text-2xl sm:text-3xl font-bold text-oro my-2 tabular-nums">{top3[2].gamesWon}</p>
                <p className="text-xs text-naipe-700">victorias</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge className="bg-noche-200 text-naipe-400 border-none text-[10px]">
                    {top3[2].winRate}% WR
                  </Badge>
                  {top3[2].streak && top3[2].streak > 0 && (
                    <Badge className="bg-oro/20 text-oro border-none text-[10px]">
                      <Flame className="w-2 h-2 mr-0.5" />
                      {top3[2].streak}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla del resto */}
        {rest.length > 0 && (
          <Card className="card-club border-0 overflow-hidden">
            <CardHeader className="border-b border-paño/20 py-4">
              <div className="grid grid-cols-12 gap-2 text-xs text-naipe-700 font-semibold uppercase tracking-wide">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Jugador</div>
                <div className="col-span-2 text-center">PJ</div>
                <div className="col-span-2 text-center">PG</div>
                <div className="col-span-2 text-center">Racha</div>
                <div className="col-span-1 text-center">Fichas</div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-paño/10">
                  {rest.map((player) => (
                    <div 
                      key={player.userId}
                      className="grid grid-cols-12 gap-2 items-center p-4 hover:bg-paño/5 transition-colors"
                    >
                      <div className="col-span-1">
                        <span className="w-8 h-8 rounded-full bg-noche-200 flex items-center justify-center text-sm font-bold text-naipe-600">
                          {player.position}
                        </span>
                      </div>
                      
                      <div className="col-span-4">
                        <p className="font-semibold text-naipe truncate">{player.username}</p>
                        <p className="text-xs text-naipe-700">{player.winRate}% WR</p>
                      </div>
                      
                      <div className="col-span-2 text-center">
                        <span className="text-naipe-400 font-semibold tabular-nums">{player.gamesPlayed}</span>
                      </div>
                      
                      <div className="col-span-2 text-center">
                        <span className="text-oro font-bold tabular-nums">{player.gamesWon}</span>
                      </div>
                      
                      <div className="col-span-2 text-center">
                        {player.streak && player.streak > 0 ? (
                          <Badge className="bg-oro/20 text-oro border-none text-xs">
                            <Flame className="w-3 h-3 mr-0.5" />
                            {player.streak}
                          </Badge>
                        ) : (
                          <span className="text-naipe-700">-</span>
                        )}
                      </div>
                      
                      <div className="col-span-1 text-center">
                        <span className={`font-semibold tabular-nums ${player.creditsWon > 0 ? 'text-paño-50' : player.creditsWon < 0 ? 'text-destructive' : 'text-naipe-600'}`}>
                          {player.creditsWon > 0 ? '+' : ''}{player.creditsWon}
                        </span>
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <Badge className="bg-celeste/20 text-celeste border-celeste/30 mb-3">
            <Trophy className="w-3 h-3 mr-1" />
            Competitivo
          </Badge>
          <h1 className="text-3xl lg:text-5xl font-bold text-naipe mb-2 tracking-tight">
            TABLA DE LIGA
          </h1>
          <p className="text-naipe-600">Los mejores jugadores de Truco Argentino</p>
        </div>
        
        {/* Weekly Countdown */}
        <Card className="card-club border-0 max-w-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-club bg-celeste/10 border border-celeste/30 flex items-center justify-center shrink-0">
              <Timer className="w-6 h-6 text-celeste" />
            </div>
            <div>
              <p className="text-xs text-naipe-700 mb-1.5 font-semibold uppercase tracking-wide">Fecha cierra en</p>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-naipe tabular-nums">{countdown.days}</p>
                  <p className="text-[10px] text-naipe-700">días</p>
                </div>
                <span className="text-naipe-700 font-light">:</span>
                <div className="text-center">
                  <p className="text-2xl font-bold text-naipe tabular-nums">{countdown.hours}</p>
                  <p className="text-[10px] text-naipe-700">hs</p>
                </div>
                <span className="text-naipe-700 font-light">:</span>
                <div className="text-center">
                  <p className="text-2xl font-bold text-naipe tabular-nums">{countdown.minutes}</p>
                  <p className="text-[10px] text-naipe-700">min</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="card-club border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-club bg-celeste/10 border border-celeste/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-celeste" />
              </div>
              <div>
                <p className="text-xs text-naipe-700">Jugadores</p>
                <p className="text-xl font-bold text-naipe tabular-nums">{data.global.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-club border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-club bg-oro/10 border border-oro/30 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-oro" />
              </div>
              <div>
                <p className="text-xs text-naipe-700">Líder Global</p>
                <p className="text-lg font-bold text-naipe truncate">
                  {data.global[0]?.username || '-'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-club border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-club bg-paño/10 border border-paño/30 flex items-center justify-center">
                <Medal className="w-5 h-5 text-paño-50" />
              </div>
              <div>
                <p className="text-xs text-naipe-700">Líder Semanal</p>
                <p className="text-lg font-bold text-naipe truncate">
                  {data.weekly[0]?.username || '-'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-club border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-club bg-paño/10 border border-paño/30 flex items-center justify-center">
                <Coins className="w-5 h-5 text-paño-50" />
              </div>
              <div>
                <p className="text-xs text-naipe-700">Top Ganancias</p>
                <p className="text-xl font-bold text-paño-50 tabular-nums">
                  +{data.global[0]?.creditsWon || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList className="bg-noche-100 border border-paño/20 p-1 rounded-club">
          <TabsTrigger 
            value="weekly" 
            className="rounded-club data-[state=active]:bg-paño/20 data-[state=active]:text-paño-50 text-naipe-600"
          >
            <Clock className="w-4 h-4 mr-2" />
            Semanal
          </TabsTrigger>
          <TabsTrigger 
            value="global" 
            className="rounded-club data-[state=active]:bg-oro/20 data-[state=active]:text-oro text-naipe-600"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Global
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 bg-noche-100 rounded-club" />)}
              </div>
              <Skeleton className="h-80 bg-noche-100 rounded-club" />
            </div>
          ) : (
            renderLeaderboard(data?.weekly || [], true)
          )}
        </TabsContent>

        <TabsContent value="global">
          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 bg-noche-100 rounded-club" />)}
              </div>
              <Skeleton className="h-80 bg-noche-100 rounded-club" />
            </div>
          ) : (
            renderLeaderboard(data?.global || [], false)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
