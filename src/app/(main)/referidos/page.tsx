'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Gift, 
  Copy, 
  Check, 
  Users, 
  Coins, 
  Share2,
  Clock,
  Trophy,
  RefreshCw,
  ChevronRight,
  Sparkles
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ReferralData {
  referralCode: string
  referralLink: string
  stats: {
    totalReferrals: number
    pendingReferrals: number
    activatedReferrals: number
    totalEarned: number
  }
  referrals: Array<{
    id: string
    username: string
    status: 'PENDING' | 'ACTIVATED' | 'PURCHASED'
    gamesCompleted: number
    bonusEarned: number
    createdAt: string
    activatedAt: string | null
  }>
  config: {
    signupBonus: number
    activationBonus: number
    purchaseBonus: number
    gamesToActivate: number
  }
}

export default function ReferidosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<ReferralData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/referidos')
      return
    }
    
    if (status === 'authenticated') {
      fetchReferrals()
    }
  }, [status, router])

  const fetchReferrals = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/referrals')
      const result = await res.json()
      if (res.ok) {
        setData(result)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar referidos')
    } finally {
      setIsLoading(false)
    }
  }

  const copyLink = () => {
    if (data?.referralLink) {
      navigator.clipboard.writeText(data.referralLink)
      setCopied(true)
      toast.success('Link copiado!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyCode = () => {
    if (data?.referralCode) {
      navigator.clipboard.writeText(data.referralCode)
      setCopied(true)
      toast.success('Código copiado!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareLink = async () => {
    if (data?.referralLink && navigator.share) {
      try {
        await navigator.share({
          title: 'Unite a Truco Argentino',
          text: `Registrate con mi código y recibí ${data.config.signupBonus} fichas gratis!`,
          url: data.referralLink,
        })
      } catch {
        copyLink()
      }
    } else {
      copyLink()
    }
  }

  const regenerateCode = async () => {
    setIsRegenerating(true)
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate' }),
      })
      const result = await res.json()
      if (res.ok) {
        setData(prev => prev ? { ...prev, referralCode: result.referralCode, referralLink: result.referralLink } : null)
        toast.success('Código regenerado!')
      }
    } catch {
      toast.error('Error al regenerar código')
    } finally {
      setIsRegenerating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-oro/20 text-oro border-oro/30">Pendiente</Badge>
      case 'ACTIVATED':
        return <Badge className="bg-paño/20 text-paño-50 border-paño/30">Activado</Badge>
      case 'PURCHASED':
        return <Badge className="bg-celeste/20 text-celeste border-celeste/30">Premium</Badge>
      default:
        return null
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8 bg-noche-100" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 bg-noche-100" />
          <Skeleton className="h-64 bg-noche-100" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Badge className="bg-paño/20 text-paño-50 border-paño/30 mb-3">
          <Gift className="w-3 h-3 mr-1" />
          Programa de referidos
        </Badge>
        <h1 className="text-3xl lg:text-4xl font-bold text-naipe mb-2 tracking-tight">
          INVITÁ AMIGOS
        </h1>
        <p className="text-naipe-600">
          Compartí tu código y ganá fichas cuando se registren y jueguen
        </p>
      </div>

      {/* Bonos info */}
      {data && (
        <Card className="card-club border-0 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-paño/20 via-paño/10 to-paño/20 p-4 sm:p-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-oro" />
              <h2 className="text-lg font-bold text-naipe">Bonos disponibles</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <div className="text-center p-3 rounded-club bg-oro/10 border border-oro/30">
                <div className="text-2xl mb-1">🎁</div>
                <p className="text-xs text-naipe-600 mb-1">Tu amigo recibe</p>
                <p className="text-xl font-bold text-oro">+{data.config.signupBonus}</p>
                <p className="text-[10px] text-naipe-700">al registrarse</p>
              </div>
              <div className="text-center p-3 rounded-club bg-paño/10 border border-paño/30">
                <div className="text-2xl mb-1">🏆</div>
                <p className="text-xs text-naipe-600 mb-1">Vos recibís</p>
                <p className="text-xl font-bold text-paño-50">+{data.config.activationBonus}</p>
                <p className="text-[10px] text-naipe-700">cuando juegue {data.config.gamesToActivate} partidas</p>
              </div>
              <div className="text-center p-3 rounded-club bg-celeste/10 border border-celeste/30">
                <div className="text-2xl mb-1">💎</div>
                <p className="text-xs text-naipe-600 mb-1">Bonus extra</p>
                <p className="text-xl font-bold text-celeste">+{data.config.purchaseBonus}</p>
                <p className="text-[10px] text-naipe-700">si hace su primera compra</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tu código */}
        <Card className="card-club border-0">
          <CardHeader>
            <CardTitle className="text-naipe flex items-center gap-2">
              <Share2 className="w-5 h-5 text-paño-50" />
              Tu código de referido
            </CardTitle>
            <CardDescription className="text-naipe-600">
              Compartilo con amigos para ganar fichas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data && (
              <>
                {/* Código grande */}
                <div className="p-4 rounded-club bg-paño/10 border-2 border-paño/40 text-center">
                  <p className="text-3xl sm:text-4xl font-mono font-bold text-naipe tracking-[0.2em]">
                    {data.referralCode}
                  </p>
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 btn-pano"
                    onClick={copyCode}
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copiar código
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-paño/30 text-naipe-400 hover:bg-paño/10"
                    onClick={shareLink}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Link completo */}
                <div className="p-3 rounded-club bg-noche-200 border border-paño/20">
                  <p className="text-xs text-naipe-700 mb-1">Link de invitación:</p>
                  <p className="text-sm text-naipe-400 break-all font-mono">{data.referralLink}</p>
                </div>

                {/* Regenerar */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-naipe-700 hover:text-naipe"
                  onClick={regenerateCode}
                  disabled={isRegenerating}
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                  Regenerar código
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="card-club border-0">
          <CardHeader>
            <CardTitle className="text-naipe flex items-center gap-2">
              <Trophy className="w-5 h-5 text-oro" />
              Tus estadísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-club bg-noche-200 text-center">
                  <Users className="w-6 h-6 text-paño-50 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-naipe">{data.stats.totalReferrals}</p>
                  <p className="text-xs text-naipe-700">Referidos totales</p>
                </div>
                <div className="p-4 rounded-club bg-noche-200 text-center">
                  <Check className="w-6 h-6 text-paño-50 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-paño-50">{data.stats.activatedReferrals}</p>
                  <p className="text-xs text-naipe-700">Activados</p>
                </div>
                <div className="p-4 rounded-club bg-noche-200 text-center">
                  <Clock className="w-6 h-6 text-oro mx-auto mb-2" />
                  <p className="text-3xl font-bold text-oro">{data.stats.pendingReferrals}</p>
                  <p className="text-xs text-naipe-700">Pendientes</p>
                </div>
                <div className="p-4 rounded-club bg-oro/10 border border-oro/30 text-center">
                  <Coins className="w-6 h-6 text-oro mx-auto mb-2" />
                  <p className="text-3xl font-bold text-oro">+{data.stats.totalEarned}</p>
                  <p className="text-xs text-naipe-700">Fichas ganadas</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de referidos */}
      {data && data.referrals.length > 0 && (
        <Card className="card-club border-0 mt-6">
          <CardHeader>
            <CardTitle className="text-naipe">Tus referidos</CardTitle>
            <CardDescription className="text-naipe-600">
              {data.referrals.length} usuarios registrados con tu código
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {data.referrals.map((referral) => (
                  <div 
                    key={referral.id}
                    className="flex items-center justify-between p-4 rounded-club bg-noche-200 border border-paño/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-paño/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-paño-50" />
                      </div>
                      <div>
                        <p className="font-semibold text-naipe">{referral.username}</p>
                        <div className="flex items-center gap-2 text-xs text-naipe-700">
                          <span>{new Date(referral.createdAt).toLocaleDateString('es-AR')}</span>
                          {referral.status === 'PENDING' && (
                            <span>• {referral.gamesCompleted}/{data.config.gamesToActivate} partidas</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {referral.bonusEarned > 0 && (
                        <span className="text-sm font-bold text-oro">+{referral.bonusEarned}</span>
                      )}
                      {getStatusBadge(referral.status)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {data && data.referrals.length === 0 && (
        <Card className="card-club border-0 mt-6">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-noche-200 flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-naipe-700" />
            </div>
            <h3 className="text-xl font-bold text-naipe mb-2">Sin referidos todavía</h3>
            <p className="text-naipe-600 mb-6 max-w-md mx-auto">
              Compartí tu código con amigos y empezá a ganar fichas cuando se registren
            </p>
            <Button className="btn-pano" onClick={shareLink}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartir mi código
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

