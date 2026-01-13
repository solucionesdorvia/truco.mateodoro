'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter,
  Calendar,
  Info,
  ShoppingCart,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Clock
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

interface Transaction {
  id: string
  amount: number
  type: string
  note: string | null
  createdAt: string
  room?: {
    mode: string
    codeTeamA: string
    codeTeamB: string
  }
}

const typeLabels: Record<string, { label: string; color: string }> = {
  ADMIN_LOAD: { label: 'Carga Admin', color: 'text-green-400 bg-green-400/10' },
  ADMIN_ADJUST: { label: 'Ajuste Admin', color: 'text-purple-400 bg-purple-400/10' },
  GAME_ENTRY_FEE: { label: 'Entrada', color: 'text-amber-400 bg-amber-400/10' },
  STAKE_LOCK: { label: 'Stake Bloqueado', color: 'text-red-400 bg-red-400/10' },
  STAKE_REFUND: { label: 'Reembolso Stake', color: 'text-blue-400 bg-blue-400/10' },
  STAKE_PAYOUT: { label: 'Pago Stake', color: 'text-green-400 bg-green-400/10' },
  REFUND: { label: 'Reembolso', color: 'text-blue-400 bg-blue-400/10' },
}

export default function FichasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/fichas')
      return
    }
    
    if (status === 'authenticated') {
      fetchTransactions()
    }
  }, [status, router])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/credits/transactions')
      const data = await res.json()
      if (res.ok) {
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTransactions = filter === 'ALL' 
    ? transactions 
    : transactions.filter(t => t.type === filter)

  const totalIn = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalOut = Math.abs(transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0))

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mis Fichas</h1>
          <p className="text-slate-400">Gestioná tu saldo y mirá tus movimientos</p>
        </div>
        
        <div className="flex gap-2">
          {/* How it works */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-slate-700 text-slate-300">
                <HelpCircle className="w-4 h-4 mr-2" />
                Cómo funciona
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-white">Cómo funcionan las fichas</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Sistema de economía del juego
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <h3 className="text-amber-400 font-semibold mb-2">1 Ficha = 1 Crédito</h3>
                  <p className="text-sm text-slate-400">
                    Las fichas son la moneda interna del juego. Se usan para participar en partidas con apuesta.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Modos de apuesta:</h4>
                  
                  <div className="p-3 rounded-lg bg-slate-800/50">
                    <p className="text-green-400 font-medium text-sm">Entrada Fija</p>
                    <p className="text-xs text-slate-500">
                      Cada jugador paga un monto fijo al entrar. El pozo total se reparte entre el equipo ganador.
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-slate-800/50">
                    <p className="text-purple-400 font-medium text-sm">Pozo por Equipo (TEAM_POOL)</p>
                    <p className="text-xs text-slate-500">
                      Cada equipo arma su propio pozo. Los jugadores aportan lo que quieran hasta completar el total.
                      Al ganar, se reparte proporcional al aporte o a un receptor elegido.
                    </p>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <p className="text-slate-300 text-sm">
                    <Info className="w-4 h-4 inline mr-2 text-blue-400" />
                    Las fichas solo se usan dentro de la plataforma. No hay retiros de dinero real.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Buy Credits - Placeholder */}
          <Button className="bg-gradient-to-r from-amber-500 to-orange-600" disabled>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Comprar Fichas
            <Badge className="ml-2 bg-slate-900/50" variant="secondary">Pronto</Badge>
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Current Balance */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Saldo Actual</p>
                <p className="text-3xl font-bold text-white">
                  {session?.user?.creditsBalance ?? 0}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Fichas disponibles para jugar</p>
          </CardContent>
        </Card>

        {/* Total In */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Ingresado</p>
                <p className="text-3xl font-bold text-green-400">+{totalIn}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Fichas recibidas (todo el tiempo)</p>
          </CardContent>
        </Card>

        {/* Total Out */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Gastado</p>
                <p className="text-3xl font-bold text-red-400">-{totalOut}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Fichas apostadas (todo el tiempo)</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Historial de Movimientos</CardTitle>
            <CardDescription className="text-slate-400">
              {filteredTransactions.length} movimientos
            </CardDescription>
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="ADMIN_LOAD">Cargas</SelectItem>
              <SelectItem value="STAKE_LOCK">Stakes</SelectItem>
              <SelectItem value="STAKE_PAYOUT">Pagos</SelectItem>
              <SelectItem value="STAKE_REFUND">Reembolsos</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">No hay movimientos</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {filteredTransactions.map((tx) => {
                  const typeInfo = typeLabels[tx.type] || { label: tx.type, color: 'text-slate-400 bg-slate-400/10' }
                  const isPositive = tx.amount > 0
                  
                  return (
                    <div 
                      key={tx.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        {isPositive ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className={`text-xs ${typeInfo.color}`}>
                            {typeInfo.label}
                          </Badge>
                          {tx.room && (
                            <span className="text-xs text-slate-500 font-mono">
                              {tx.room.codeTeamA}
                            </span>
                          )}
                        </div>
                        {tx.note && (
                          <p className="text-sm text-slate-400 truncate">{tx.note}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(tx.createdAt).toLocaleString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      
                      <div className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{tx.amount}
                      </div>
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

