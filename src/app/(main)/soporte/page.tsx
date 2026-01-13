'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { 
  HelpCircle, 
  MessageSquare, 
  ChevronDown,
  Send,
  Coins,
  Gamepad2,
  Bug,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail
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
    category: 'general',
    question: '¿Cómo empiezo a jugar?',
    answer: 'Creá una cuenta gratis, luego andá a "Jugar" y creá una partida o unite con un código que te compartan. Podés jugar partidas 1v1, 2v2 o 3v3.'
  },
  {
    category: 'general',
    question: '¿Qué modos de juego hay?',
    answer: 'Tenemos 3 modos: 1v1 (mano a mano), 2v2 (duplas) y 3v3 (equipos). Cada modo puede jugarse a 15 o 30 puntos, con o sin flor.'
  },
  {
    category: 'fichas',
    question: '¿Qué son las fichas?',
    answer: 'Las fichas son la moneda interna del juego. Se usan para participar en partidas con apuesta. 1 ficha = 1 crédito. No tienen valor monetario real.'
  },
  {
    category: 'fichas',
    question: '¿Cómo consigo fichas?',
    answer: 'Por ahora, las fichas son cargadas por los administradores. Próximamente habilitaremos la compra de fichas.'
  },
  {
    category: 'fichas',
    question: '¿Qué es el modo TEAM_POOL?',
    answer: 'En este modo, cada equipo arma un pozo colectivo. Cada jugador aporta lo que quiera hasta completar el total. Al ganar, se reparte proporcional al aporte o se puede elegir un receptor único.'
  },
  {
    category: 'partida',
    question: '¿Qué pasa si me desconecto?',
    answer: 'Si te desconectás brevemente, podés volver a la partida. Si pasa mucho tiempo, tu equipo puede continuar en desventaja. Las fichas apostadas no se reembolsan por desconexión voluntaria.'
  },
  {
    category: 'partida',
    question: '¿Cómo funciona el timer?',
    answer: 'Si el creador activa el timer, cada jugador tiene un tiempo límite para hacer su jugada. Si se acaba el tiempo, pierde el turno automáticamente.'
  },
  {
    category: 'partida',
    question: '¿Puedo abandonar una partida?',
    answer: 'Sí, pero si hay fichas en juego, las perdés. En TEAM_POOL, tu equipo puede continuar pero en desventaja.'
  },
]

const categoryIcons = {
  PAGOS: CreditCard,
  FICHAS: Coins,
  PARTIDA: Gamepad2,
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
      toast.error('Ingresá tu email para que podamos contactarte')
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
      toast.success('Ticket enviado correctamente')
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
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <HelpCircle className="w-8 h-8 text-blue-400" />
          Centro de Soporte
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          ¿Tenés alguna duda o problema? Revisá las preguntas frecuentes o envianos un ticket.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* FAQ Section */}
        <div id="faq">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                Preguntas Frecuentes
              </CardTitle>
              <CardDescription className="text-slate-400">
                Las dudas más comunes de nuestros jugadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {faqItems.map((item, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border border-slate-800 rounded-lg px-4 data-[state=open]:bg-slate-800/30"
                  >
                    <AccordionTrigger className="text-white hover:text-amber-400 hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] border-slate-700 text-slate-500"
                        >
                          {item.category}
                        </Badge>
                        <span className="text-sm">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-400 text-sm pb-4">
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
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-green-400" />
                Enviar un Ticket
              </CardTitle>
              <CardDescription className="text-slate-400">
                ¿No encontraste la respuesta? Escribinos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">¡Ticket Enviado!</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Te responderemos lo antes posible.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-slate-700"
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({ subject: '', category: '', body: '', roomId: '', email: '' })
                    }}
                  >
                    Enviar otro ticket
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email (if not logged in) */}
                  {!session && (
                    <div className="space-y-2">
                      <Label className="text-slate-200">
                        Tu Email <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-slate-800 border-slate-700 pl-10"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label className="text-slate-200">
                      Asunto <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      placeholder="Resumen del problema"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-slate-200">
                      Categoría <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="PAGOS">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Pagos / Compras
                          </div>
                        </SelectItem>
                        <SelectItem value="FICHAS">
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4" />
                            Fichas / Saldo
                          </div>
                        </SelectItem>
                        <SelectItem value="PARTIDA">
                          <div className="flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4" />
                            Problema en partida
                          </div>
                        </SelectItem>
                        <SelectItem value="BUG">
                          <div className="flex items-center gap-2">
                            <Bug className="w-4 h-4" />
                            Bug / Error
                          </div>
                        </SelectItem>
                        <SelectItem value="OTRO">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Otro
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Room ID (optional) */}
                  {formData.category === 'PARTIDA' && (
                    <div className="space-y-2">
                      <Label className="text-slate-200">
                        Código de Partida <span className="text-slate-500">(opcional)</span>
                      </Label>
                      <Input
                        placeholder="Ej: ABC123"
                        value={formData.roomId}
                        onChange={(e) => setFormData({ ...formData, roomId: e.target.value.toUpperCase() })}
                        className="bg-slate-800 border-slate-700 uppercase"
                        maxLength={6}
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-slate-200">
                      Descripción <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      placeholder="Contanos qué pasó con el mayor detalle posible..."
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      className="bg-slate-800 border-slate-700 min-h-[150px]"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
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
                        Enviar Ticket
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="bg-slate-900/50 border-slate-800 mt-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Tiempo de respuesta</p>
                  <p className="text-sm text-slate-400">Generalmente respondemos en menos de 24hs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

