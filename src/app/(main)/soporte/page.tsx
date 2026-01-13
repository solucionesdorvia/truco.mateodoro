'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { 
  LifeBuoy, 
  MessageSquare, 
  Send,
  Coins,
  Swords,
  Bug,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  HelpCircle,
  ChevronDown
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

const faqItems = [
  {
    category: 'inicio',
    question: '¿Cómo arranco a jugar?',
    answer: 'Creá una cuenta gratis, andá a "Jugar" y armá una mesa o unite con un código que te pasen. Podés jugar 1v1, 2v2 o 3v3.'
  },
  {
    category: 'inicio',
    question: '¿Qué modos de juego hay?',
    answer: 'Hay 3 modos: 1v1 (mano a mano), 2v2 (duplas) y 3v3 (equipos). Cada uno puede jugarse a 15 o 30 puntos, con o sin flor.'
  },
  {
    category: 'fichas',
    question: '¿Qué son las fichas?',
    answer: 'Las fichas son la moneda interna. 1 ficha = 1 crédito. Se usan para partidas con pozo. No tienen valor monetario real fuera de la plataforma.'
  },
  {
    category: 'fichas',
    question: '¿Cómo consigo fichas?',
    answer: 'Por ahora las carga el admin. Próximamente habilitamos compra de fichas.'
  },
  {
    category: 'fichas',
    question: '¿Qué es el modo pozo por equipo (TEAM_POOL)?',
    answer: 'Cada equipo arma un pozo colectivo. Cada jugador aporta lo que quiera hasta completar el total. Al ganar, se reparte proporcional al aporte o a un receptor elegido por el equipo.'
  },
  {
    category: 'partida',
    question: '¿Qué pasa si me desconecto?',
    answer: 'Si volvés rápido, retomás la partida. Si tardás mucho, tu equipo sigue en desventaja. Las fichas apostadas no se devuelven por desconexión.'
  },
  {
    category: 'partida',
    question: '¿Cómo funciona el timer?',
    answer: 'Si el creador activa el timer, cada jugador tiene tiempo límite para jugar. Si se te acaba, perdés el turno automáticamente.'
  },
  {
    category: 'partida',
    question: '¿Qué es el código de equipo?',
    answer: 'Al crear una mesa, se generan 2 códigos: uno para el Equipo A y otro para el B. Pasale el código correspondiente a cada jugador para que entre en el equipo correcto.'
  },
]

const categoryIcons = {
  PAGOS: CreditCard,
  FICHAS: Coins,
  PARTIDA: Swords,
  BUG: Bug,
  OTRO: AlertCircle,
}

export default function SoportePage() {
  const { data: session } = useSession()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    body: '',
    roomId: '',
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.subject || !formData.category || !formData.body) {
      toast.error('Completá todos los campos requeridos')
      return
    }
    
    if (!session && !formData.email) {
      toast.error('Ingresá tu email para que podamos responderte')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al enviar')
      }
      
      setSubmitted(true)
      toast.success('Ticket enviado')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="bg-celeste/20 text-celeste border-celeste/30 mb-3">
          <LifeBuoy className="w-3 h-3 mr-1" />
          Ayuda
        </Badge>
        <h1 className="text-3xl lg:text-5xl font-bold text-naipe mb-4 tracking-tight">
          SOPORTE
        </h1>
        <p className="text-naipe-600 max-w-xl mx-auto">
          ¿Tenés alguna duda o problema? Revisá las preguntas frecuentes o mandanos un ticket.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* FAQ Section */}
        <div id="faq">
          <Card className="card-club border-0">
            <CardHeader className="border-b border-paño/20">
              <CardTitle className="text-naipe flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-oro" />
                Preguntas frecuentes
              </CardTitle>
              <CardDescription className="text-naipe-600">
                Las dudas más comunes de los jugadores
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Accordion type="single" collapsible className="space-y-2">
                {faqItems.map((item, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border border-paño/20 rounded-club px-4 data-[state=open]:bg-paño/5"
                  >
                    <AccordionTrigger className="text-naipe hover:text-oro hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <Badge 
                          className="bg-noche-200 text-naipe-700 border-none text-[10px]"
                        >
                          {item.category}
                        </Badge>
                        <span className="text-sm">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-naipe-400 text-sm pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Form */}
        <div>
          <Card className="card-club border-0">
            <CardHeader className="border-b border-paño/20">
              <CardTitle className="text-naipe flex items-center gap-2">
                <Send className="w-5 h-5 text-paño-50" />
                Pedir ayuda
              </CardTitle>
              <CardDescription className="text-naipe-600">
                ¿No encontraste la respuesta? Escribinos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-paño/20 border border-paño/30 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-paño-50" />
                  </div>
                  <h3 className="text-xl font-bold text-naipe mb-2">¡Ticket enviado!</h3>
                  <p className="text-naipe-600 text-sm mb-6">
                    Te respondemos lo antes posible.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-paño/30 text-naipe-400 rounded-club"
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({ subject: '', category: '', body: '', roomId: '', email: '' })
                    }}
                  >
                    Enviar otro ticket
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email (if not logged in) */}
                  {!session && (
                    <div className="space-y-2">
                      <Label className="text-naipe-300 text-sm">
                        Tu email <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-naipe-700" />
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-noche-200 border-paño/20 pl-10 text-naipe rounded-club"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label className="text-naipe-300 text-sm">
                      Asunto <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="Resumen del problema"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="bg-noche-200 border-paño/20 text-naipe rounded-club"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-naipe-300 text-sm">
                      Categoría <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger className="bg-noche-200 border-paño/20 text-naipe rounded-club">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent className="bg-noche-200 border-paño/20">
                        <SelectItem value="PAGOS">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-naipe-600" />
                            Pagos / Compras
                          </div>
                        </SelectItem>
                        <SelectItem value="FICHAS">
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-oro" />
                            Fichas / Saldo
                          </div>
                        </SelectItem>
                        <SelectItem value="PARTIDA">
                          <div className="flex items-center gap-2">
                            <Swords className="w-4 h-4 text-paño-50" />
                            Problema en partida
                          </div>
                        </SelectItem>
                        <SelectItem value="BUG">
                          <div className="flex items-center gap-2">
                            <Bug className="w-4 h-4 text-destructive" />
                            Bug / Error
                          </div>
                        </SelectItem>
                        <SelectItem value="OTRO">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-naipe-600" />
                            Otro
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Room ID (optional) */}
                  {formData.category === 'PARTIDA' && (
                    <div className="space-y-2">
                      <Label className="text-naipe-300 text-sm">
                        Código de partida <span className="text-naipe-700">(opcional)</span>
                      </Label>
                      <Input
                        placeholder="ABC123"
                        value={formData.roomId}
                        onChange={(e) => setFormData({ ...formData, roomId: e.target.value.toUpperCase() })}
                        className="bg-noche-200 border-paño/20 uppercase text-naipe rounded-club font-mono tracking-wider"
                        maxLength={6}
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-naipe-300 text-sm">
                      Descripción <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      placeholder="Contanos qué pasó con el mayor detalle posible..."
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      className="bg-noche-200 border-paño/20 text-naipe rounded-club min-h-[150px]"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-pano"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar ticket
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Response time */}
          <Card className="card-club border-0 mt-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-club bg-celeste/10 border border-celeste/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-celeste" />
                </div>
                <div>
                  <p className="text-naipe font-medium">Tiempo de respuesta</p>
                  <p className="text-sm text-naipe-600">Generalmente respondemos en menos de 24hs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
