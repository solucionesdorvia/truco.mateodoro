'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface User {
  id: string
  email: string
  username: string
  role: string
  creditsBalance: number
  createdAt: string
}

interface Stats {
  totalUsers: number
  totalCreditsIssued: number
  transactionsToday: number
  activeRooms: number
}

interface Room {
  id: string
  mode: string
  status: string
  stakeMode: string
  codeTeamA: string
  codeTeamB: string
  createdAt: string
  createdBy: { username: string }
  _count: { players: number }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loadAmount, setLoadAmount] = useState(100)
  const [adjustAmount, setAdjustAmount] = useState(0)
  const [adjustNote, setAdjustNote] = useState('')
  const [platformFee, setPlatformFee] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    if (session.user.role !== 'ADMIN') {
      toast.error('Acceso denegado')
      router.push('/')
      return
    }

    fetchStats()
    fetchUsers()
    fetchRooms()
    fetchSettings()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (res.ok) setStats(data.stats)
    } catch {
      console.error('Error fetching stats')
    }
  }

  const fetchUsers = async (query?: string) => {
    try {
      const url = query ? `/api/admin/users?q=${encodeURIComponent(query)}` : '/api/admin/users'
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) setUsers(data.users)
    } catch {
      console.error('Error fetching users')
    }
  }

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/admin/rooms')
      const data = await res.json()
      if (res.ok) setRooms(data.rooms)
    } catch {
      console.error('Error fetching rooms')
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (res.ok) setPlatformFee(data.settings.platformFeePercent)
    } catch {
      console.error('Error fetching settings')
    }
  }

  const handleSearch = () => {
    fetchUsers(searchQuery)
  }

  const handleLoadCredits = async () => {
    if (!selectedUser || loadAmount <= 0) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/credits/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, amount: loadAmount }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Se cargaron $${loadAmount} créditos a ${selectedUser.username}`)
        fetchUsers(searchQuery)
        fetchStats()
        setSelectedUser({ ...selectedUser, creditsBalance: data.newBalance })
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Error al cargar créditos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdjustCredits = async () => {
    if (!selectedUser || adjustAmount === 0 || !adjustNote.trim()) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/credits/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: adjustAmount,
          note: adjustNote,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Ajuste de $${adjustAmount} realizado`)
        fetchUsers(searchQuery)
        fetchStats()
        setSelectedUser({ ...selectedUser, creditsBalance: data.newBalance })
        setAdjustAmount(0)
        setAdjustNote('')
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Error al ajustar créditos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateFee = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformFeePercent: platformFee }),
      })
      if (res.ok) {
        toast.success('Comisión actualizada')
      } else {
        toast.error('Error al actualizar')
      }
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="container mx-auto max-w-7xl py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
            <p className="text-slate-400">Gestión de Truco Argentino</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/')} className="border-slate-600 text-slate-300">
            Volver al Inicio
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-4 text-center">
                <p className="text-slate-400 text-sm">Total Usuarios</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-4 text-center">
                <p className="text-slate-400 text-sm">Créditos Emitidos</p>
                <p className="text-3xl font-bold text-amber-400">${stats.totalCreditsIssued}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-4 text-center">
                <p className="text-slate-400 text-sm">Transacciones Hoy</p>
                <p className="text-3xl font-bold text-green-400">{stats.transactionsToday}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-4 text-center">
                <p className="text-slate-400 text-sm">Salas Activas</p>
                <p className="text-3xl font-bold text-blue-400">{stats.activeRooms}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main content */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="rooms">Partidas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* User list */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Usuarios</CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar por email o username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                    <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                      Buscar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                          selectedUser?.id === user.id
                            ? 'bg-blue-600/30 border border-blue-500'
                            : 'bg-slate-900/50 hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{user.username}</p>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={user.role === 'ADMIN' ? 'bg-purple-600' : 'bg-slate-600'}>
                              {user.role}
                            </Badge>
                            <p className="text-amber-400 font-medium mt-1">${user.creditsBalance}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* User actions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    {selectedUser ? `Gestionar: ${selectedUser.username}` : 'Selecciona un usuario'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedUser ? (
                    <>
                      {/* User info */}
                      <div className="p-4 bg-slate-900/50 rounded-lg">
                        <p className="text-slate-300">Email: {selectedUser.email}</p>
                        <p className="text-slate-300">Rol: {selectedUser.role}</p>
                        <p className="text-amber-400 text-xl font-bold">
                          Saldo: ${selectedUser.creditsBalance}
                        </p>
                      </div>

                      {/* Load credits */}
                      <div className="space-y-2">
                        <Label className="text-slate-200">Cargar Créditos</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={1}
                            value={loadAmount}
                            onChange={(e) => setLoadAmount(parseInt(e.target.value) || 0)}
                            className="bg-slate-900 border-slate-600 text-white"
                          />
                          <Button
                            onClick={handleLoadCredits}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Cargar
                          </Button>
                        </div>
                      </div>

                      {/* Adjust credits */}
                      <div className="space-y-2">
                        <Label className="text-slate-200">Ajustar Créditos</Label>
                        <Input
                          type="number"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                          placeholder="Monto (positivo o negativo)"
                          className="bg-slate-900 border-slate-600 text-white"
                        />
                        <Input
                          value={adjustNote}
                          onChange={(e) => setAdjustNote(e.target.value)}
                          placeholder="Motivo del ajuste (requerido)"
                          className="bg-slate-900 border-slate-600 text-white"
                        />
                        <Button
                          onClick={handleAdjustCredits}
                          disabled={isLoading || !adjustNote.trim() || adjustAmount === 0}
                          className="w-full bg-amber-600 hover:bg-amber-700"
                        >
                          Realizar Ajuste
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      Selecciona un usuario de la lista para gestionar sus créditos
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Partidas</CardTitle>
                <CardDescription className="text-slate-400">
                  Lista de salas activas y recientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {rooms.map((room) => (
                    <div key={room.id} className="p-4 bg-slate-900/50 rounded-lg mb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">
                            {room.mode.replace(/_/g, ' ')}
                            <Badge className="ml-2" variant={
                              room.status === 'PLAYING' ? 'default' :
                              room.status === 'WAITING' ? 'secondary' :
                              room.status === 'FINISHED' ? 'outline' : 'destructive'
                            }>
                              {room.status}
                            </Badge>
                          </p>
                          <p className="text-slate-400 text-sm">
                            Creado por: {room.createdBy.username} • 
                            Jugadores: {room._count.players}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-400 font-mono text-sm">{room.codeTeamA}</p>
                          <p className="text-red-400 font-mono text-sm">{room.codeTeamB}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-slate-800/50 border-slate-700 max-w-md">
              <CardHeader>
                <CardTitle className="text-white">Configuración Global</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Comisión de Plataforma (%)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      value={platformFee}
                      onChange={(e) => setPlatformFee(parseInt(e.target.value) || 0)}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                    <Button
                      onClick={handleUpdateFee}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Guardar
                    </Button>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Este porcentaje se descuenta del pozo total en partidas con apuesta
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

