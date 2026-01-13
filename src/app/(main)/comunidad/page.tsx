'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { 
  Users, 
  MessageSquare, 
  Plus,
  Heart,
  Clock,
  Tag,
  Send,
  Lightbulb,
  Gamepad2,
  UserPlus,
  MessagesSquare,
  Filter
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Post {
  id: string
  title: string | null
  body: string
  category: string
  likes: number
  createdAt: string
  user: {
    username: string
  }
}

const categoryConfig = {
  TIP: { label: 'Tip', icon: Lightbulb, color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  PARTIDA: { label: 'Partida', icon: Gamepad2, color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  BUSCO_EQUIPO: { label: 'Busco Equipo', icon: UserPlus, color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  GENERAL: { label: 'General', icon: MessagesSquare, color: 'text-slate-400 bg-slate-400/10 border-slate-400/30' },
}

export default function ComunidadPage() {
  const { data: session } = useSession()
  
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: 'GENERAL',
  })

  useEffect(() => {
    fetchPosts()
  }, [filter])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const url = filter === 'ALL' 
        ? '/api/community/posts' 
        : `/api/community/posts?category=${filter}`
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.body.trim()) {
      toast.error('Escribí algo para publicar')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al publicar')
      }
      
      toast.success('¡Publicado!')
      setDialogOpen(false)
      setFormData({ title: '', body: '', category: 'GENERAL' })
      fetchPosts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al publicar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!session) {
      toast.error('Iniciá sesión para dar like')
      return
    }
    
    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
      })
      
      if (res.ok) {
        setPosts(posts.map(p => 
          p.id === postId ? { ...p, likes: p.likes + 1 } : p
        ))
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            Comunidad
          </h1>
          <p className="text-slate-400">Conectá con otros jugadores, compartí tips y buscá equipo</p>
        </div>
        
        <div className="flex gap-2">
          {/* Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="TIP">Tips</SelectItem>
              <SelectItem value="PARTIDA">Partidas</SelectItem>
              <SelectItem value="BUSCO_EQUIPO">Busco Equipo</SelectItem>
              <SelectItem value="GENERAL">General</SelectItem>
            </SelectContent>
          </Select>
          
          {/* New Post Button */}
          {session ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Publicar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Nueva Publicación</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Compartí algo con la comunidad
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-slate-200">Categoría</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="TIP">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            Tip / Consejo
                          </div>
                        </SelectItem>
                        <SelectItem value="PARTIDA">
                          <div className="flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4 text-green-400" />
                            Partida / Anécdota
                          </div>
                        </SelectItem>
                        <SelectItem value="BUSCO_EQUIPO">
                          <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-blue-400" />
                            Busco Equipo
                          </div>
                        </SelectItem>
                        <SelectItem value="GENERAL">
                          <div className="flex items-center gap-2">
                            <MessagesSquare className="w-4 h-4 text-slate-400" />
                            General
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Title (optional) */}
                  <div className="space-y-2">
                    <Label className="text-slate-200">
                      Título <span className="text-slate-500">(opcional)</span>
                    </Label>
                    <Input
                      placeholder="Un título llamativo"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      maxLength={100}
                    />
                  </div>
                  
                  {/* Body */}
                  <div className="space-y-2">
                    <Label className="text-slate-200">
                      Mensaje <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      placeholder="¿Qué querés compartir?"
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      className="bg-slate-800 border-slate-700 min-h-[120px]"
                      maxLength={500}
                      required
                    />
                    <p className="text-xs text-slate-500 text-right">
                      {formData.body.length}/500
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Publicando...' : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Publicar
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="outline" className="border-slate-700" disabled>
              Iniciá sesión para publicar
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Posts Feed */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))
          ) : posts.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500">No hay publicaciones todavía</p>
                <p className="text-sm text-slate-600 mt-1">¡Sé el primero en publicar!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => {
              const config = categoryConfig[post.category as keyof typeof categoryConfig] || categoryConfig.GENERAL
              const Icon = config.icon
              
              return (
                <Card key={post.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-slate-700">
                          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white text-sm">
                            {post.user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{post.user.username}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(post.createdAt)}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${config.color} text-xs`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    
                    {/* Content */}
                    {post.title && (
                      <h3 className="font-semibold text-white mb-2">{post.title}</h3>
                    )}
                    <p className="text-slate-300 whitespace-pre-wrap">{post.body}</p>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-800">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-500 hover:text-red-400"
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {post.likes}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-700 text-slate-300 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30"
                onClick={() => {
                  if (session) {
                    setFormData({ ...formData, category: 'BUSCO_EQUIPO' })
                    setDialogOpen(true)
                  } else {
                    toast.error('Iniciá sesión para publicar')
                  }
                }}
              >
                <UserPlus className="w-4 h-4 mr-3 text-blue-400" />
                Buscar equipo
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-700 text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30"
                onClick={() => {
                  if (session) {
                    setFormData({ ...formData, category: 'TIP' })
                    setDialogOpen(true)
                  } else {
                    toast.error('Iniciá sesión para publicar')
                  }
                }}
              >
                <Lightbulb className="w-4 h-4 mr-3 text-amber-400" />
                Compartir tip
              </Button>
            </CardContent>
          </Card>

          {/* Community Stats */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Comunidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Publicaciones</span>
                <span className="text-white font-bold">{posts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Esta semana</span>
                <span className="text-white font-bold">
                  {posts.filter(p => {
                    const postDate = new Date(p.createdAt)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return postDate > weekAgo
                  }).length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Categories Legend */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Categorías</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const Icon = config.icon
                return (
                  <div 
                    key={key}
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
                    onClick={() => setFilter(key)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color.split(' ')[1]}`}>
                      <Icon className={`w-4 h-4 ${config.color.split(' ')[0]}`} />
                    </div>
                    <span className="text-sm text-slate-300">{config.label}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

