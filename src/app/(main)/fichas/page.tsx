'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter,
  Info,
  ShoppingCart,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Target,
  ChevronRight
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

const typeLabels: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN_LOAD: { label: 'Carga', color: 'text-paño-50', bg: 'bg-paño/20' },
  ADMIN_ADJUST: { label: 'Ajuste', color: 'text-celeste', bg: 'bg-celeste/20' },
  GAME_ENTRY_FEE: { label: 'Entrada', color: 'text-oro', bg: 'bg-oro/20' },
  STAKE_LOCK: { label: 'Pozo', color: 'text-destructive', bg: 'bg-destructive/20' },
  STAKE_REFUND: { label: 'Reembolso', color: 'text-celeste', bg: 'bg-celeste/20' },
  STAKE_PAYOUT: { label: 'Premio', color: 'text-paño-50', bg: 'bg-paño/20' },
  REFUND: { label: 'Devolución', color: 'text-celeste', bg: 'bg-celeste/20' },
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
        <Skeleton className="h-10 w-48 mb-8 bg-noche-100" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 bg-noche-100" />
          <Skeleton className="h-40 bg-noche-100" />
          <Skeleton className="h-40 bg-noche-100" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Badge className="bg-oro/20 text-oro border-oro/30 mb-3">
            <Coins className="w-3 h-3 mr-1" />
            Billetera
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-naipe mb-2 tracking-tight">MIS FICHAS</h1>
          <p className="text-naipe-600">Tu saldo y movimientos</p>
        </div>
        
        <div className="flex gap-2">
          {/* How it works */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-paño/30 text-naipe-400 hover:bg-noche-100 rounded-club">
                <HelpCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Cómo funcionan los pozos</span>
                <span className="sm:hidden">Pozos</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-noche-100 border-paño/20 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-naipe flex items-center gap-2">
                  <Coins className="w-5 h-5 text-oro" />
                  Cómo funcionan los pozos
                </DialogTitle>
                <DialogDescription className="text-naipe-600">
                  Sistema de fichas y apuestas
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="p-4 rounded-club bg-oro/10 border border-oro/30">
                  <h3 className="text-oro font-bold text-lg mb-2">1 ficha = 1 crédito</h3>
                  <p className="text-sm text-naipe-400">
                    Las fichas son la moneda del juego. Se usan para entrar en partidas con pozo.
                  </p>
                </div>
                
                {/* Example 3v3 */}
                <div className="space-y-3">
                  <h4 className="text-naipe font-semibold">Ejemplo: 3v3 con pozo de 100 por equipo</h4>
                  
                  <div className="p-4 rounded-club bg-noche-200 space-y-4">
                    <div>
                      <p className="text-xs text-naipe-700 mb-2">EQUIPO A aporta 100 fichas:</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-equipoA-bg text-equipoA border-equipoA-border">Doro: 60</Badge>
                        <Badge className="bg-equipoA-bg text-equipoA border-equipoA-border">Lucho: 20</Badge>
                        <Badge className="bg-equipoA-bg text-equipoA border-equipoA-border">Mateo: 20</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-naipe-700 mb-2">EQUIPO B aporta 100 fichas:</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-equipoB-bg text-equipoB border-equipoB-border">Rival 1: 50</Badge>
                        <Badge className="bg-equipoB-bg text-equipoB border-equipoB-border">Rival 2: 30</Badge>
                        <Badge className="bg-equipoB-bg text-equipoB border-equipoB-border">Rival 3: 20</Badge>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-paño/20">
                      <p className="text-oro font-bold text-center">Pozo total: 200 fichas</p>
                    </div>
                  </div>
                </div>

                {/* Payout modes */}
                <div className="space-y-3">
                  <h4 className="text-naipe font-semibold">Modos de reparto (si gana Equipo A):</h4>
                  
                  <div className="p-3 rounded-club bg-paño/10 border border-paño/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-paño-50" />
                      <span className="font-semibold text-paño-50 text-sm">Proporcional</span>
                    </div>
                    <p className="text-xs text-naipe-600 mb-2">Cada jugador recibe según lo que aportó:</p>
                    <div className="flex gap-2 flex-wrap text-xs">
                      <span className="text-naipe-400">Doro: 120</span>
                      <span className="text-naipe-400">Lucho: 40</span>
                      <span className="text-naipe-400">Mateo: 40</span>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-club bg-celeste/10 border border-celeste/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-celeste" />
                      <span className="font-semibold text-celeste text-sm">Se lo lleva uno</span>
                    </div>
                    <p className="text-xs text-naipe-600 mb-2">Un jugador elegido recibe todo:</p>
                    <div className="text-xs">
                      <span className="text-naipe-400">Doro: 200 (elegido por el equipo)</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 rounded-club bg-noche-200 border border-paño/20">
                  <p className="text-naipe-400 text-xs flex items-start gap-2">
                    <Info className="w-4 h-4 text-celeste shrink-0 mt-0.5" />
                    Las fichas solo se usan dentro de la plataforma. No hay retiro de dinero real.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Buy Credits - Placeholder */}
          <Button className="btn-oro" disabled>
            <ShoppingCart className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Cargar fichas</span>
            <span className="sm:hidden">Cargar</span>
            <Badge className="ml-2 bg-noche/50 text-naipe-400 border-none text-[10px]">Pronto</Badge>
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Current Balance */}
        <Card className="card-club border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-oro/10 to-oro/5" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-naipe-600 mb-1">Saldo actual</p>
                <p className="text-5xl font-bold text-oro tabular-nums">
                  {session?.user?.creditsBalance ?? 0}
                </p>
                <p className="text-xs text-naipe-700 mt-2">fichas disponibles</p>
              </div>
              <div className="w-14 h-14 rounded-club bg-oro/20 border border-oro/30 flex items-center justify-center">
                <Coins className="w-7 h-7 text-oro" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total In */}
        <Card className="card-club border-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-naipe-600 mb-1">Total ingresado</p>
                <p className="text-4xl font-bold text-paño-50 tabular-nums">+{totalIn}</p>
                <p className="text-xs text-naipe-700 mt-2">fichas recibidas</p>
              </div>
              <div className="w-12 h-12 rounded-club bg-paño/20 border border-paño/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-paño-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Out */}
        <Card className="card-club border-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-naipe-600 mb-1">Total apostado</p>
                <p className="text-4xl font-bold text-destructive tabular-nums">-{totalOut}</p>
                <p className="text-xs text-naipe-700 mt-2">fichas en pozos</p>
              </div>
              <div className="w-12 h-12 rounded-club bg-destructive/20 border border-destructive/30 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="card-club border-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-paño/20">
          <div>
            <CardTitle className="text-naipe">Movimientos</CardTitle>
            <CardDescription className="text-naipe-700">
              {filteredTransactions.length} registros
            </CardDescription>
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-noche-200 border-paño/20 text-naipe rounded-club">
              <Filter className="w-4 h-4 mr-2 text-naipe-600" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent className="bg-noche-200 border-paño/20">
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="ADMIN_LOAD">Cargas</SelectItem>
              <SelectItem value="STAKE_LOCK">Pozos</SelectItem>
              <SelectItem value="STAKE_PAYOUT">Premios</SelectItem>
              <SelectItem value="STAKE_REFUND">Reembolsos</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 bg-noche-200 rounded-club" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-noche-200 flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-naipe-700" />
              </div>
              <p className="text-naipe-600 mb-2">Sin movimientos</p>
              <p className="text-naipe-700 text-sm">Tus transacciones aparecerán acá</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {filteredTransactions.map((tx) => {
                  const typeInfo = typeLabels[tx.type] || { label: tx.type, color: 'text-naipe-600', bg: 'bg-noche-200' }
                  const isPositive = tx.amount > 0
                  
                  return (
                    <div 
                      key={tx.id}
                      className="flex items-center gap-4 p-4 rounded-club bg-noche-200 border border-paño/10 hover:border-paño/30 transition-all duration-200 group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isPositive ? 'bg-paño/20' : 'bg-destructive/20'}`}>
                        {isPositive ? (
                          <ArrowDownLeft className="w-5 h-5 text-paño-50" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${typeInfo.bg} ${typeInfo.color} border-none text-xs`}>
                            {typeInfo.label}
                          </Badge>
                          {tx.room && (
                            <span className="text-xs text-naipe-700 font-mono">
                              {tx.room.codeTeamA}
                            </span>
                          )}
                        </div>
                        {tx.note && (
                          <p className="text-sm text-naipe-400 truncate">{tx.note}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-naipe-700 mt-1">
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
                      
                      <div className={`text-xl font-bold tabular-nums ${isPositive ? 'text-paño-50' : 'text-destructive'}`}>
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
