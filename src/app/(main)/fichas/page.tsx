'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

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
  REFERRAL_BONUS_REFERRER: { label: 'Bonus referido', color: 'text-paño-50', bg: 'bg-paño/20' },
  REFERRAL_BONUS_REFERRED: { label: 'Bonus bienvenida', color: 'text-paño-50', bg: 'bg-paño/20' },
  REFERRAL_PURCHASE_BONUS: { label: 'Bonus compra', color: 'text-oro', bg: 'bg-oro/20' },
}

const purchaseOptions = [
  { id: 'inicio', tipo: 'Inicio', amount: 2000 },
  { id: 'pro', tipo: 'Pro', amount: 5000 },
  { id: 'club', tipo: 'Club', amount: 7000 },
  { id: 'elite', tipo: 'Elite', amount: 10000 },
  { id: 'leyenda', tipo: 'Leyenda', amount: 15000 },
]

const MIN_PURCHASE = 2000

export default function FichasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(purchaseOptions[0].amount)
  const [customAmount, setCustomAmount] = useState(MIN_PURCHASE)

  const isAdmin = session?.user?.role === 'ADMIN'
  const effectiveAmount = useMemo(() => (
    selectedAmount === 'custom' ? customAmount : selectedAmount
  ), [selectedAmount, customAmount])
  const isAmountValid = effectiveAmount >= MIN_PURCHASE

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

  const handlePurchase = () => {
    if (!isAmountValid) {
      toast.error(`El mínimo es ${MIN_PURCHASE} fichas`)
      return
    }
    toast.message('Compra en preparación', {
      description: `Monto seleccionado: ${effectiveAmount} fichas`,
    })
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Badge className="bg-oro/20 text-oro border-oro/30 mb-3">
            <Coins className="w-3 h-3 mr-1" />
            Billetera
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-naipe mb-2 tracking-tight">MIS FICHAS</h1>
          <p className="text-naipe-600">Tu saldo, movimientos y compras</p>
        </div>

        <div className="flex gap-2">
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

                <div className="p-3 rounded-club bg-noche-200 border border-paño/20">
                  <p className="text-naipe-400 text-xs flex items-start gap-2">
                    <Info className="w-4 h-4 text-celeste shrink-0 mt-0.5" />
                    Las fichas solo se usan dentro de la plataforma. No hay retiro de dinero real.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="card-club border-0 mb-8">
        <CardHeader className="border-b border-paño/20">
          <CardTitle className="text-naipe flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-oro" />
            Comprar fichas
          </CardTitle>
          <CardDescription className="text-naipe-700">
            Mínimo de compra: {MIN_PURCHASE} fichas.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {purchaseOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedAmount(option.amount)}
                className={`rounded-club border p-4 text-left transition-all ${
                  selectedAmount === option.amount
                    ? 'bg-oro/10 border-oro/40'
                    : 'bg-noche-200 border-paño/20 hover:border-paño/40'
                }`}
              >
                <p className="text-[10px] uppercase tracking-widest text-naipe-700">Tipo</p>
                <p className="text-sm font-semibold text-naipe">{option.tipo}</p>
                <p className="text-xl font-bold text-oro mt-2">{option.amount.toLocaleString('es-AR')}</p>
                <p className="text-xs text-naipe-700">fichas</p>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedAmount('custom')}
              className={`rounded-club border p-4 text-left transition-all ${
                selectedAmount === 'custom'
                  ? 'bg-oro/10 border-oro/40'
                  : 'bg-noche-200 border-paño/20 hover:border-paño/40'
              }`}
            >
              <p className="text-[10px] uppercase tracking-widest text-naipe-700">Tipo</p>
              <p className="text-sm font-semibold text-naipe">Otro monto</p>
              <p className="text-xs text-naipe-600 mt-2">Elegí tu cantidad</p>
            </button>
          </div>

          {selectedAmount === 'custom' && (
            <div className="space-y-2 max-w-xs">
              <Input
                type="number"
                min={MIN_PURCHASE}
                value={customAmount}
                onChange={(event) => setCustomAmount(parseInt(event.target.value) || 0)}
                className="bg-noche-200 border-paño/20 text-naipe text-center text-lg font-semibold"
              />
              {!isAmountValid && (
                <p className="text-xs text-destructive">El mínimo es {MIN_PURCHASE} fichas.</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-naipe-600">Monto seleccionado</p>
              <p className="text-2xl font-bold text-oro">{effectiveAmount.toLocaleString('es-AR')} fichas</p>
            </div>
            <Button className="btn-oro" disabled={!isAmountValid} onClick={handlePurchase}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Comprar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
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

        {isAdmin ? (
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
        ) : (
          <Card className="card-club border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-naipe-600 mb-1">Mesas jugadas</p>
                  <p className="text-4xl font-bold text-naipe-400 tabular-nums">{transactions.filter(t => t.amount < 0).length}</p>
                  <p className="text-xs text-naipe-700 mt-2">participaciones</p>
                </div>
                <div className="w-12 h-12 rounded-club bg-celeste/10 border border-celeste/30 flex items-center justify-center">
                  <Target className="w-6 h-6 text-celeste" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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

                  const displayLabel = !isPositive && !isAdmin
                    ? (tx.type === 'STAKE_LOCK' ? 'Mesa jugada' : 'Participación')
                    : typeInfo.label

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 p-4 rounded-club bg-noche-200 border border-paño/10 hover:border-paño/30 transition-all duration-200 group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isPositive ? 'bg-paño/20' : (isAdmin ? 'bg-destructive/20' : 'bg-noche-300')
                      }`}>
                        {isPositive ? (
                          <ArrowDownLeft className="w-5 h-5 text-paño-50" />
                        ) : (
                          <ArrowUpRight className={`w-5 h-5 ${isAdmin ? 'text-destructive' : 'text-naipe-600'}`} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${isPositive || isAdmin ? typeInfo.bg : 'bg-noche-300'} ${isPositive || isAdmin ? typeInfo.color : 'text-naipe-500'} border-none text-xs`}>
                            {displayLabel}
                          </Badge>
                          {tx.room && (
                            <span className="text-xs text-naipe-700 font-mono">
                              {tx.room.codeTeamA}
                            </span>
                          )}
                        </div>
                        {tx.note && isAdmin && (
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

                      {isPositive ? (
                        <div className="text-xl font-bold tabular-nums text-paño-50">
                          +{tx.amount}
                        </div>
                      ) : isAdmin ? (
                        <div className="text-xl font-bold tabular-nums text-destructive">
                          {tx.amount}
                        </div>
                      ) : (
                        <div className="text-sm text-naipe-600">
                          —
                        </div>
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
