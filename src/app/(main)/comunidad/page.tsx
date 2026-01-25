'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import {
  Users,
  Search,
  UserPlus,
  Check,
  X,
  Swords,
  Coins,
  Copy,
  Clock,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface PublicUser {
  id: string
  username: string
  avatarUrl?: string | null
}

interface FriendRequest {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  fromUserId: string
  toUserId: string
  fromUser: PublicUser
  toUser: PublicUser
  createdAt: string
}

interface CreatedRoom {
  id: string
  codeTeamA: string
  codeTeamB: string
}

export default function ComunidadPage() {
  const { status } = useSession()

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<PublicUser[]>([])

  const [friends, setFriends] = useState<PublicUser[]>([])
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([])
  const [isLoadingFriends, setIsLoadingFriends] = useState(true)

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteTarget, setInviteTarget] = useState<PublicUser | null>(null)
  const [inviteMode, setInviteMode] = useState<'NONE' | 'ENTRY_FEE'>('NONE')
  const [inviteAmount, setInviteAmount] = useState(100)
  const [inviteRoom, setInviteRoom] = useState<CreatedRoom | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)

  const friendIds = useMemo(() => new Set(friends.map(friend => friend.id)), [friends])
  const outgoingIds = useMemo(() => new Set(outgoingRequests.map(req => req.toUserId)), [outgoingRequests])

  useEffect(() => {
    if (status !== 'authenticated') return
    void loadFriends()
    void loadRequests()
  }, [status])

  const loadFriends = async () => {
    setIsLoadingFriends(true)
    try {
      const res = await fetch('/api/friends')
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al cargar amigos')
      }
      setFriends(data.friends)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar amigos')
    } finally {
      setIsLoadingFriends(false)
    }
  }

  const loadRequests = async () => {
    try {
      const res = await fetch('/api/friends/requests')
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al cargar solicitudes')
      }
      setIncomingRequests(data.incoming)
      setOutgoingRequests(data.outgoing)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar solicitudes')
    }
  }

  const handleSearch = async () => {
    if (status !== 'authenticated') {
      toast.error('Entrá para buscar usuarios')
      return
    }
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al buscar usuarios')
      }
      setSearchResults(data.users)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al buscar usuarios')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendRequest = async (userId: string) => {
    try {
      const res = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar solicitud')
      }
      toast.success(data.message || 'Solicitud enviada')
      await loadRequests()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar solicitud')
    }
  }

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject' | 'cancel') => {
    try {
      const res = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar solicitud')
      }
      toast.success(data.message || 'Solicitud actualizada')
      await Promise.all([loadFriends(), loadRequests()])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar solicitud')
    }
  }

  const openInviteDialog = (user: PublicUser, mode: 'NONE' | 'ENTRY_FEE') => {
    setInviteTarget(user)
    setInviteMode(mode)
    setInviteAmount(100)
    setInviteRoom(null)
    setInviteDialogOpen(true)
    if (mode === 'NONE') {
      void createRoomInvite(mode)
    }
  }

  const createRoomInvite = async (mode: 'NONE' | 'ENTRY_FEE') => {
    if (!inviteTarget) return
    setInviteLoading(true)
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'ONE_VS_ONE',
          targetScore: 15,
          florEnabled: false,
          chatEnabled: true,
          timerEnabled: false,
          timerSeconds: 25,
          stakeMode: mode,
          entryFeeCredits: mode === 'ENTRY_FEE' ? inviteAmount : undefined,
          payoutMode: 'PROPORTIONAL',
          isPublic: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la mesa')
      }
      setInviteRoom({
        id: data.room.id,
        codeTeamA: data.room.codeTeamA,
        codeTeamB: data.room.codeTeamB,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear la mesa')
    } finally {
      setInviteLoading(false)
    }
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Código copiado')
    } catch {
      toast.error('No se pudo copiar el código')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <Badge className="bg-paño/20 text-paño-50 border-paño/30 mb-3">
            <Users className="w-3 h-3 mr-1" />
            Comunidad
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-naipe mb-2 tracking-tight">AMIGOS</h1>
          <p className="text-naipe-600">
            Buscá usuarios, agregá amigos y organizá partidas rápidas.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-club border-0">
            <CardHeader className="border-b border-paño/20">
              <CardTitle className="text-naipe flex items-center gap-2">
                <Search className="w-4 h-4 text-paño-50" />
                Buscar usuarios
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Ingresá un usuario"
                  className="bg-noche-200 border-paño/20 text-naipe rounded-club"
                />
                <Button
                  onClick={handleSearch}
                  className="btn-pano"
                  disabled={isSearching || searchQuery.trim().length < 2}
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>

              <div className="space-y-2">
                {searchResults.length === 0 && (
                  <p className="text-sm text-naipe-700">
                    Escribí al menos 2 letras para buscar jugadores.
                  </p>
                )}
                {searchResults.map((user) => {
                  const isFriend = friendIds.has(user.id)
                  const isPending = outgoingIds.has(user.id)
                  return (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-club bg-noche-200 border border-paño/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-paño/20 border border-paño/30 flex items-center justify-center text-naipe font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-naipe font-semibold">@{user.username}</p>
                          <p className="text-xs text-naipe-700">Disponible para jugar</p>
                        </div>
                      </div>
                      <div>
                        {isFriend ? (
                          <Badge className="bg-paño/20 text-paño-50 border-paño/30">Amigo</Badge>
                        ) : isPending ? (
                          <Badge className="bg-noche-200 text-naipe-500 border-paño/20">Solicitud enviada</Badge>
                        ) : (
                          <Button size="sm" onClick={() => handleSendRequest(user.id)} className="btn-oro">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Agregar
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="card-club border-0">
            <CardHeader className="border-b border-paño/20">
              <CardTitle className="text-naipe flex items-center gap-2">
                <Users className="w-4 h-4 text-paño-50" />
                Mis amigos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {isLoadingFriends ? (
                <p className="text-sm text-naipe-600">Cargando amigos...</p>
              ) : friends.length === 0 ? (
                <p className="text-sm text-naipe-600">Todavía no agregaste amigos.</p>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-club bg-noche-200 border border-paño/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-paño/20 border border-paño/30 flex items-center justify-center text-naipe font-bold">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-naipe font-semibold">@{friend.username}</p>
                        <p className="text-xs text-naipe-700">Disponible para retos</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="border-paño/30 text-naipe-400 rounded-club"
                        onClick={() => openInviteDialog(friend, 'NONE')}
                      >
                        <Swords className="w-4 h-4 mr-2" />
                        Invitar a partida
                      </Button>
                      <Button size="sm" className="btn-oro" onClick={() => openInviteDialog(friend, 'ENTRY_FEE')}>
                        <Coins className="w-4 h-4 mr-2" />
                        Jugar por fichas
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="card-club border-0">
            <CardHeader className="border-b border-paño/20">
              <CardTitle className="text-naipe flex items-center gap-2">
                <Clock className="w-4 h-4 text-oro" />
                Solicitudes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-naipe-700 uppercase tracking-wide">Entrantes</p>
                {incomingRequests.length === 0 ? (
                  <p className="text-sm text-naipe-600">Sin solicitudes nuevas.</p>
                ) : (
                  incomingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between gap-2 p-3 rounded-club bg-noche-200 border border-paño/10">
                      <div>
                        <p className="text-naipe font-semibold">@{request.fromUser.username}</p>
                        <p className="text-xs text-naipe-700">Quiere agregarte</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" className="btn-pano" onClick={() => handleRequestAction(request.id, 'accept')}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="border-paño/30 text-naipe-400" onClick={() => handleRequestAction(request.id, 'reject')}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-naipe-700 uppercase tracking-wide">Enviadas</p>
                {outgoingRequests.length === 0 ? (
                  <p className="text-sm text-naipe-600">No enviaste solicitudes.</p>
                ) : (
                  outgoingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between gap-2 p-3 rounded-club bg-noche-200 border border-paño/10">
                      <div>
                        <p className="text-naipe font-semibold">@{request.toUser.username}</p>
                        <p className="text-xs text-naipe-700">Pendiente</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-paño/30 text-naipe-400"
                        onClick={() => handleRequestAction(request.id, 'cancel')}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={inviteDialogOpen} onOpenChange={(open) => {
        setInviteDialogOpen(open)
        if (!open) {
          setInviteTarget(null)
          setInviteRoom(null)
          setInviteLoading(false)
        }
      }}>
        <DialogContent className="bg-noche-100 border-paño/20">
          <DialogHeader>
            <DialogTitle className="text-naipe">
              {inviteMode === 'ENTRY_FEE' ? 'Desafío por fichas' : 'Invitar a partida'}
            </DialogTitle>
            <DialogDescription className="text-naipe-600">
              {inviteTarget ? `Invitá a @${inviteTarget.username}` : 'Generando invitación'}
            </DialogDescription>
          </DialogHeader>

          {inviteMode === 'ENTRY_FEE' && !inviteRoom && (
            <div className="space-y-4 py-2">
              <Input
                type="number"
                min={1}
                value={inviteAmount}
                onChange={(event) => setInviteAmount(parseInt(event.target.value) || 0)}
                className="bg-noche-200 border-oro/30 text-naipe text-center text-xl font-bold"
                placeholder="Monto en fichas"
              />
              <Button
                className="btn-oro w-full"
                onClick={() => createRoomInvite('ENTRY_FEE')}
                disabled={inviteLoading || inviteAmount < 1}
              >
                {inviteLoading ? 'Creando...' : 'Crear desafío'}
              </Button>
            </div>
          )}

          {inviteLoading && inviteMode === 'NONE' && (
            <p className="text-sm text-naipe-600">Generando mesa...</p>
          )}

          {inviteRoom && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-club bg-equipoA-bg border border-equipoA-border text-center">
                  <p className="text-xs text-equipoA font-semibold mb-2">CÓDIGO A</p>
                  <p className="text-lg font-mono font-bold text-naipe">{inviteRoom.codeTeamA}</p>
                  <Button size="sm" variant="ghost" className="text-equipoA hover:bg-equipoA/20 mt-2"
                    onClick={() => copyCode(inviteRoom.codeTeamA)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </Button>
                </div>
                <div className="p-3 rounded-club bg-equipoB-bg border border-equipoB-border text-center">
                  <p className="text-xs text-equipoB font-semibold mb-2">CÓDIGO B</p>
                  <p className="text-lg font-mono font-bold text-naipe">{inviteRoom.codeTeamB}</p>
                  <Button size="sm" variant="ghost" className="text-equipoB hover:bg-equipoB/20 mt-2"
                    onClick={() => copyCode(inviteRoom.codeTeamB)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </Button>
                </div>
              </div>
              <p className="text-xs text-naipe-600">
                Compartí el código correcto para que tu amigo entre al equipo correspondiente.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
