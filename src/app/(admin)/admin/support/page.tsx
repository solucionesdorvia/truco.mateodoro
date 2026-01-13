'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  MessageSquare, 
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Filter,
  Send
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

interface Ticket {
  id: string
  email: string | null
  subject: string
  category: string
  body: string
  status: string
  roomId: string | null
  createdAt: string
  user: {
    username: string
    email: string
  } | null
  messages: {
    id: string
    body: string
    isAdmin: boolean
    createdAt: string
  }[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Abierto', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  IN_PROGRESS: { label: 'En Progreso', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  RESOLVED: { label: 'Resuelto', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  CLOSED: { label: 'Cerrado', color: 'text-slate-400 bg-slate-400/10 border-slate-400/30' },
}

export default function AdminSupportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')
  const [reply, setReply] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }
    fetchTickets()
  }, [session, status, router])

  const fetchTickets = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/support/tickets')
      const data = await res.json()
      if (res.ok) {
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (res.ok) {
        toast.success('Estado actualizado')
        fetchTickets()
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus })
        }
      }
    } catch (error) {
      toast.error('Error al actualizar')
    }
  }

  const handleReply = async () => {
    if (!selectedTicket || !reply.trim()) return
    
    setIsSending(true)
    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: reply }),
      })
      
      if (res.ok) {
        toast.success('Respuesta enviada')
        setReply('')
        fetchTickets()
        // Refresh selected ticket
        const updatedTicket = tickets.find(t => t.id === selectedTicket.id)
        if (updatedTicket) {
          setSelectedTicket(updatedTicket)
        }
      }
    } catch (error) {
      toast.error('Error al enviar')
    } finally {
      setIsSending(false)
    }
  }

  const filteredTickets = filter === 'ALL' 
    ? tickets 
    : tickets.filter(t => t.status === filter)

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="container mx-auto max-w-7xl py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-green-400" />
              Soporte
            </h1>
            <p className="text-slate-400">Gestión de tickets de soporte</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="border-slate-600 text-slate-300">
            Volver al Admin
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => {
            const count = tickets.filter(t => t.status === status).length
            const config = statusConfig[status]
            return (
              <Card key={status} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">{config.label}</p>
                    <p className="text-2xl font-bold text-white">{count}</p>
                  </div>
                  <Badge variant="outline" className={config.color}>
                    {config.label}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tickets List */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Tickets</CardTitle>
                <CardDescription className="text-slate-400">
                  {filteredTickets.length} tickets
                </CardDescription>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32 bg-slate-900 border-slate-600">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="OPEN">Abiertos</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="RESOLVED">Resueltos</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-green-400/50 mx-auto mb-4" />
                  <p className="text-slate-500">No hay tickets pendientes</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {filteredTickets.map((ticket) => {
                      const config = statusConfig[ticket.status]
                      return (
                        <div 
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            selectedTicket?.id === ticket.id
                              ? 'bg-blue-500/20 border border-blue-500/50'
                              : 'bg-slate-900/50 hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">{ticket.subject}</p>
                              <p className="text-xs text-slate-500">
                                {ticket.user?.username || ticket.email}
                              </p>
                            </div>
                            <Badge variant="outline" className={`${config.color} text-xs ml-2`}>
                              {config.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.createdAt).toLocaleString('es-AR')}
                            <Badge variant="secondary" className="text-[10px]">
                              {ticket.category}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Ticket Detail */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedTicket ? selectedTicket.subject : 'Seleccionar ticket'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTicket ? (
                <div className="space-y-6">
                  {/* Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Usuario</p>
                      <p className="text-white">{selectedTicket.user?.username || 'Anónimo'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Email</p>
                      <p className="text-white">{selectedTicket.user?.email || selectedTicket.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Categoría</p>
                      <p className="text-white">{selectedTicket.category}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Estado</p>
                      <Select 
                        value={selectedTicket.status} 
                        onValueChange={(v) => handleStatusChange(selectedTicket.id, v)}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-600 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="OPEN">Abierto</SelectItem>
                          <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                          <SelectItem value="RESOLVED">Resuelto</SelectItem>
                          <SelectItem value="CLOSED">Cerrado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Original Message */}
                  <div className="p-4 rounded-lg bg-slate-900/50">
                    <p className="text-xs text-slate-500 mb-2">Mensaje original</p>
                    <p className="text-slate-300 whitespace-pre-wrap">{selectedTicket.body}</p>
                  </div>
                  
                  {/* Thread */}
                  {selectedTicket.messages.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-500">Conversación</p>
                      {selectedTicket.messages.map((msg) => (
                        <div 
                          key={msg.id}
                          className={`p-3 rounded-lg ${
                            msg.isAdmin 
                              ? 'bg-blue-500/10 border border-blue-500/30 ml-4' 
                              : 'bg-slate-900/50 mr-4'
                          }`}
                        >
                          <p className="text-xs text-slate-500 mb-1">
                            {msg.isAdmin ? 'Admin' : 'Usuario'} • {new Date(msg.createdAt).toLocaleString('es-AR')}
                          </p>
                          <p className="text-slate-300 text-sm">{msg.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Reply */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Escribir respuesta..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      className="bg-slate-900 border-slate-600"
                    />
                    <Button 
                      onClick={handleReply}
                      disabled={isSending || !reply.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSending ? 'Enviando...' : 'Enviar Respuesta'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500">Seleccioná un ticket para ver los detalles</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

