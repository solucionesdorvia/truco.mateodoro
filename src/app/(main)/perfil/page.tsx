'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy,
  Target,
  Percent,
  Coins,
  Gamepad2,
  TrendingUp,
  Crown,
  Award
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

interface ProfileStats {
  gamesPlayed: number
  gamesWon: number
  winRate: number
  creditsWon: number
  weeklyGamesPlayed: number
  weeklyGamesWon: number
  weeklyWinRate: number
  ranking?: number
}

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/perfil')
      return
    }
    
    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/profile/stats')
      const data = await res.json()
      if (res.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-48" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const user = session.user

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
          <CardContent className="relative p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24 border-4 border-amber-500/30">
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-3xl font-bold">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                  {user.role === 'ADMIN' && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Miembro desde {new Date().getFullYear()}
                  </span>
                </div>
              </div>
              
              {/* Balance */}
              <div className="text-center">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <Coins className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                  <p className="text-3xl font-bold text-amber-400">{user.creditsBalance ?? 0}</p>
                  <p className="text-xs text-slate-500">Fichas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* All-time Stats */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Estadísticas Totales
              </CardTitle>
              <CardDescription className="text-slate-400">
                Tu rendimiento desde que empezaste
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : stats ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800/50 text-center">
                      <Gamepad2 className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{stats.gamesPlayed}</p>
                      <p className="text-xs text-slate-500">Partidas Jugadas</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/50 text-center">
                      <Trophy className="w-5 h-5 text-green-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-400">{stats.gamesWon}</p>
                      <p className="text-xs text-slate-500">Victorias</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <Percent className="w-4 h-4" />
                        Winrate
                      </span>
                      <span className="text-sm font-bold text-white">{stats.winRate}%</span>
                    </div>
                    <Progress value={stats.winRate} className="h-2" />
                  </div>
                  
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-slate-300">Fichas Ganadas Netas</span>
                    </div>
                    <span className={`text-xl font-bold ${stats.creditsWon >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stats.creditsWon >= 0 ? '+' : ''}{stats.creditsWon}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500">Sin estadísticas todavía</p>
                  <p className="text-sm text-slate-600">¡Jugá tu primera partida!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Stats */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Esta Semana
              </CardTitle>
              <CardDescription className="text-slate-400">
                Tu rendimiento en el ranking semanal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : stats ? (
                <>
                  {stats.ranking && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/30 text-center">
                      <p className="text-sm text-slate-400 mb-1">Tu posición</p>
                      <p className="text-4xl font-bold text-white">#{stats.ranking}</p>
                      <p className="text-xs text-purple-400">en el ranking semanal</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800/50 text-center">
                      <Gamepad2 className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{stats.weeklyGamesPlayed}</p>
                      <p className="text-xs text-slate-500">Partidas</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/50 text-center">
                      <Trophy className="w-5 h-5 text-green-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-400">{stats.weeklyGamesWon}</p>
                      <p className="text-xs text-slate-500">Victorias</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Winrate Semanal</span>
                      <span className="text-sm font-bold text-white">{stats.weeklyWinRate}%</span>
                    </div>
                    <Progress value={stats.weeklyWinRate} className="h-2" />
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500">Sin actividad esta semana</p>
                  <p className="text-sm text-slate-600">Jugá para aparecer en el ranking</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

