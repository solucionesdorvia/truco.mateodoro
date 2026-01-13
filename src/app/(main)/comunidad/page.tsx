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
  Send,
  Lightbulb,
  Swords,
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
  TIP: { label: 'Tip', icon: Lightbulb, color: 'text-oro', bg: 'bg-oro/20', border: 'border-oro/30' },
  PARTIDA: { label: 'Partida', icon: Swords, color: 'text-paño-50', bg: 'bg-paño/20', border: 'border-paño/30' },
  BUSCO_EQUIPO: { label: 'Busco Equipo', icon: UserPlus, color: 'text-celeste', bg: 'bg-celeste/20', border: 'border-celeste/30' },
  GENERAL: { label: 'General', icon: MessagesSquare, color: 'text-naipe-400', bg: 'bg-naipe/10', border: 'border-naipe/20' },
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
      toast.error('Entrá para dar like')
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
          <Badge className="bg-paño/20 text-paño-50 border-paño/30 mb-3">
            <Users className="w-3 h-3 mr-1" />
            Club
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-naipe mb-2 tracking-tight">
            COMUNIDAD
          </h1>
          <p className="text-naipe-600">Conectá con otros jugadores, compartí tips y armá equipo</p>
        </div>
        
        <div className="flex gap-2">
          {/* Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 bg-noche-200 border-paño/20 text-naipe rounded-club">
              <Filter className="w-4 h-4 mr-2 text-naipe-600" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent className="bg-noche-200 border-paño/20">
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
                <Button className="btn-pano">
                  <Plus className="w-4 h-4 mr-2" />
                  Publicar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-noche-100 border-paño/20">
                <DialogHeader>
                  <DialogTitle className="text-naipe flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-paño" />
                    Nueva publicación
                  </DialogTitle>
                  <DialogDescription className="text-naipe-600">
                    Compartí algo con la comunidad
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                  {/* Category */}
                  <div className="space-y-3">
                    <Label className="text-naipe-300 text-sm">Categoría</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(categoryConfig).map(([key, config]) => {
                        const Icon = config.icon
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`p-3 rounded-club border-2 text-left transition-all flex items-center gap-2 ${
                              formData.category === key 
                                ? `${config.bg} ${config.border} ${config.color}` 
                                : 'bg-noche-200 border-paño/20 text-naipe-600 hover:border-paño/40'
                            }`}
                            onClick={() => setFormData({ ...formData, category: key })}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{config.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Title (optional) */}
                  <div className="space-y-2">
                    <Label className="text-naipe-300 text-sm">
                      Título <span className="text-naipe-700">(opcional)</span>
                    </Label>
                    <Input
                      placeholder="Un título llamativo"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-noche-200 border-paño/20 text-naipe rounded-club"
                      maxLength={100}
                    />
                  </div>
                  
                  {/* Body */}
                  <div className="space-y-2">
                    <Label className="text-naipe-300 text-sm">
                      Mensaje <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      placeholder="¿Qué querés compartir?"
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      className="bg-noche-200 border-paño/20 text-naipe rounded-club min-h-[120px]"
                      maxLength={500}
                      required
                    />
                    <p className="text-xs text-naipe-700 text-right">
                      {formData.body.length}/500
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full btn-pano"
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
            <Button variant="outline" className="border-paño/30 text-naipe-600 rounded-club" disabled>
              Entrá para publicar
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
              <Card key={i} className="card-club border-0">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-3 bg-noche-200" />
                  <Skeleton className="h-4 w-full mb-2 bg-noche-200" />
                  <Skeleton className="h-4 w-3/4 bg-noche-200" />
                </CardContent>
              </Card>
            ))
          ) : posts.length === 0 ? (
            <Card className="card-club border-0">
              <CardContent className="p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-noche-200 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-naipe-700" />
                </div>
                <p className="text-naipe-400 mb-2">Sin publicaciones todavía</p>
                <p className="text-sm text-naipe-700">¡Sé el primero en publicar!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => {
              const config = categoryConfig[post.category as keyof typeof categoryConfig] || categoryConfig.GENERAL
              const Icon = config.icon
              
              return (
                <Card key={post.id} className="card-club border-0 hover:border-paño/30 transition-all duration-200">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-paño/20">
                          <AvatarFallback className="bg-gradient-to-br from-paño to-paño-600 text-naipe text-sm font-bold">
                            {post.user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-naipe">{post.user.username}</p>
                          <div className="flex items-center gap-2 text-xs text-naipe-700">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(post.createdAt)}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${config.bg} ${config.color} ${config.border} text-xs`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    
                    {/* Content */}
                    {post.title && (
                      <h3 className="font-bold text-naipe mb-2 text-lg">{post.title}</h3>
                    )}
                    <p className="text-naipe-300 whitespace-pre-wrap leading-relaxed">{post.body}</p>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-paño/10">
                      <button 
                        className="flex items-center gap-1.5 text-naipe-600 hover:text-destructive transition-colors"
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>
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
          <Card className="card-club border-0">
            <CardHeader className="border-b border-paño/20">
              <CardTitle className="text-naipe text-lg">Publicaciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start border-paño/20 text-naipe-400 hover:bg-celeste/10 hover:text-celeste hover:border-celeste/30 rounded-club"
                onClick={() => {
                  if (session) {
                    setFormData({ ...formData, category: 'BUSCO_EQUIPO', title: '', body: '' })
                    setDialogOpen(true)
                  } else {
                    toast.error('Entrá para publicar')
                  }
                }}
              >
                <UserPlus className="w-4 h-4 mr-3 text-celeste" />
                Busco dupla 2v2
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-paño/20 text-naipe-400 hover:bg-celeste/10 hover:text-celeste hover:border-celeste/30 rounded-club"
                onClick={() => {
                  if (session) {
                    setFormData({ ...formData, category: 'BUSCO_EQUIPO', title: 'Busco equipo 3v3', body: '' })
                    setDialogOpen(true)
                  } else {
                    toast.error('Entrá para publicar')
                  }
                }}
              >
                <UserPlus className="w-4 h-4 mr-3 text-celeste" />
                Busco equipo 3v3
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-paño/20 text-naipe-400 hover:bg-oro/10 hover:text-oro hover:border-oro/30 rounded-club"
                onClick={() => {
                  if (session) {
                    setFormData({ ...formData, category: 'TIP', title: '', body: '' })
                    setDialogOpen(true)
                  } else {
                    toast.error('Entrá para publicar')
                  }
                }}
              >
                <Lightbulb className="w-4 h-4 mr-3 text-oro" />
                Compartir tip
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="card-club border-0">
            <CardHeader className="border-b border-paño/20">
              <CardTitle className="text-naipe text-lg">Actividad</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between p-2">
                <span className="text-naipe-600 text-sm">Total publicaciones</span>
                <span className="text-naipe font-bold tabular-nums">{posts.length}</span>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-naipe-600 text-sm">Esta semana</span>
                <span className="text-naipe font-bold tabular-nums">
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
          <Card className="card-club border-0">
            <CardHeader className="border-b border-paño/20">
              <CardTitle className="text-naipe text-lg">Categorías</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const Icon = config.icon
                const count = posts.filter(p => p.category === key).length
                return (
                  <button 
                    key={key}
                    className={`w-full flex items-center justify-between p-3 rounded-club transition-all ${
                      filter === key 
                        ? `${config.bg} ${config.border} border` 
                        : 'hover:bg-noche-200'
                    }`}
                    onClick={() => setFilter(filter === key ? 'ALL' : key)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-club flex items-center justify-center ${config.bg}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <span className={`text-sm ${filter === key ? config.color : 'text-naipe-400'}`}>
                        {config.label}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold ${filter === key ? config.color : 'text-naipe-700'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
