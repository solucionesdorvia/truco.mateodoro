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
      <div className="text-center mb-8">
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

      {/* CTA Directo WhatsApp */}
      <Card className="card-club border-0 mb-8 max-w-2xl mx-auto overflow-hidden">
        <div className="bg-gradient-to-r from-[#25D366]/20 via-[#25D366]/10 to-[#25D366]/20 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-naipe text-lg mb-1">¿Necesitás ayuda rápida?</h3>
              <p className="text-naipe-600 text-sm">Hablá directamente con soporte por WhatsApp</p>
            </div>
            <a 
              href="https://wa.me/5491112345678?text=Hola,%20necesito%20ayuda%20con%20Truco%20Argentino" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Hablar con soporte
              </Button>
            </a>
          </div>
        </div>
      </Card>

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
