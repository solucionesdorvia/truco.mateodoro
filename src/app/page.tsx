'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  Swords, 
  Trophy, 
  Coins, 
  Shield, 
  Users,
  ChevronRight,
  Flame,
  Timer,
  Sparkles,
  Target,
  Crown,
  Zap
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// SVG Palos de cartas españolas
function EspadaSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={className} fill="currentColor">
      <path d="M12 0C12 0 8 6 8 10C8 13 9.5 15 12 15.5C14.5 15 16 13 16 10C16 6 12 0 12 0Z" />
      <path d="M12 15V30" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <path d="M9 26H15" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function BastoSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={className} fill="currentColor">
      <ellipse cx="12" cy="4" rx="4" ry="3.5"/>
      <path d="M10 6C10 6 9 10 9 14C9 18 10 22 10 26" strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <path d="M14 6C14 6 15 10 15 14C15 18 14 22 14 26" strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <path d="M8 26H16" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function OroSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="6" />
    </svg>
  )
}

function CopaSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 28" className={className} fill="currentColor">
      <path d="M6 0H18V2C18 8 15 12 12 14C9 12 6 8 6 2V0Z" />
      <path d="M12 14V22" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <path d="M8 22H16V24H8V22Z" />
    </svg>
  )
}

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Mesa de paño - Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-noche via-noche-100 to-noche" />
        
        {/* Paño central (efecto mesa) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] max-w-[1400px] aspect-[16/9]">
          <div className="absolute inset-0 bg-mesa-radial rounded-[100px] opacity-30" />
          <div className="absolute inset-[10%] border-2 border-paño/30 rounded-[80px]" />
        </div>
        
        {/* Cartas decorativas floating */}
        <div className="absolute top-[15%] left-[8%] opacity-20 rotate-[-15deg]">
          <div className="w-16 h-24 bg-naipe-gradient rounded-lg shadow-naipe flex items-center justify-center">
            <EspadaSVG className="w-8 h-10 text-noche-400" />
          </div>
        </div>
        <div className="absolute top-[20%] right-[10%] opacity-15 rotate-[20deg]">
          <div className="w-14 h-20 bg-naipe-gradient rounded-lg shadow-naipe flex items-center justify-center">
            <OroSVG className="w-7 h-7 text-oro-dark" />
          </div>
        </div>
        <div className="absolute bottom-[25%] left-[12%] opacity-10 rotate-[8deg]">
          <div className="w-12 h-18 bg-naipe-gradient rounded-lg shadow-naipe flex items-center justify-center">
            <BastoSVG className="w-6 h-8 text-paño-700" />
          </div>
        </div>
        <div className="absolute bottom-[30%] right-[8%] opacity-15 rotate-[-12deg]">
          <div className="w-14 h-20 bg-naipe-gradient rounded-lg shadow-naipe flex items-center justify-center">
            <CopaSVG className="w-7 h-9 text-destructive" />
          </div>
        </div>
        
        {/* Ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-paño/10 rounded-full blur-[150px]" />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-paño/20 border border-paño/40 mb-8 animate-fade-in">
              <Flame className="w-4 h-4 text-oro" />
              <span className="text-sm text-naipe-400 font-medium">Liga activa • Temporada 1</span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 tracking-tight animate-slide-up">
              <span className="text-naipe block">
                EL TRUCO COMPETITIVO
              </span>
              <span className="text-gradient-oro block mt-2">
                DE VERDAD
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-naipe-600 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
              Armá mesa, cantá envido y subí en la tabla.
              <br className="hidden sm:block" />
              <span className="text-naipe-400">Sistema de pozos por equipo. Sin vueltas.</span>
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link href="/jugar">
                <Button 
                  size="lg" 
                  className="btn-pano w-full sm:w-auto text-lg px-10 py-7 group"
                >
                  <Swords className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Jugar ahora
                </Button>
              </Link>
              <Link href="/rankings">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto border-naipe-700/50 text-naipe-400 hover:bg-noche-100 hover:text-naipe hover:border-naipe-600 text-lg px-8 py-6"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Ver tabla
                </Button>
              </Link>
            </div>
            
            {/* Mode badges */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mt-16 animate-fade-in" style={{ animationDelay: '300ms' }}>
              {[
                { mode: '1v1', label: 'Mano a mano' },
                { mode: '2v2', label: 'Duplas' },
                { mode: '3v3', label: 'Equipos' },
              ].map((item, i) => (
                <div key={item.mode} className="text-center group cursor-default">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-club bg-noche-100 border border-paño/30 flex items-center justify-center mb-2 group-hover:border-paño/60 group-hover:bg-paño/10 transition-all duration-300">
                    <span className="text-2xl sm:text-3xl font-bold text-naipe">{item.mode}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-naipe-700">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-naipe-700/50 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-naipe-700 rounded-full" />
          </div>
        </div>
      </section>

      {/* Modos Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-noche to-noche-100" />
        
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-paño/20 text-paño-50 border-paño/30 mb-4">
              <Target className="w-3 h-3 mr-1" />
              Elegí tu modo
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-naipe mb-4 tracking-tight">
              MODOS DE JUEGO
            </h2>
            <p className="text-naipe-600 max-w-xl mx-auto">
              Desde el clásico mano a mano hasta batallas de equipos con pozo compartido
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { 
                mode: '1v1', 
                title: 'Mano a Mano', 
                desc: 'El clásico. Vos contra el otro. Sin excusas.',
                icon: EspadaSVG,
                color: 'paño'
              },
              { 
                mode: '2v2', 
                title: 'Duplas', 
                desc: 'Armá dupla y competí. Comunicación es clave.',
                icon: CopaSVG,
                color: 'oro'
              },
              { 
                mode: '3v3', 
                title: 'Equipos', 
                desc: 'El modo definitivo. Pozo por equipo, gloria compartida.',
                icon: BastoSVG,
                color: 'celeste',
                featured: true
              },
            ].map((item) => {
              const IconComp = item.icon
              return (
                <Link key={item.mode} href="/jugar" className="group">
                  <div className={`card-club p-6 h-full transition-all duration-300 hover:-translate-y-2 ${item.featured ? 'ring-2 ring-oro/30' : ''}`}>
                    {item.featured && (
                      <Badge className="absolute -top-2 left-4 bg-oro text-noche border-none">
                        <Crown className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    
                    <div className={`w-14 h-14 rounded-club bg-${item.color}/10 border border-${item.color}/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComp className={`w-7 h-8 text-${item.color}`} />
                    </div>
                    
                    <div className="text-4xl font-bold text-naipe mb-2">{item.mode}</div>
                    <h3 className="text-lg font-semibold text-naipe-300 mb-2">{item.title}</h3>
                    <p className="text-sm text-naipe-700">{item.desc}</p>
                    
                    <div className="mt-4 flex items-center text-sm text-paño group-hover:text-paño-50 transition-colors">
                      <span>Jugar</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-noche-100" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-[20%]"><EspadaSVG className="w-32 h-40 text-naipe" /></div>
          <div className="absolute bottom-20 right-[15%]"><OroSVG className="w-28 h-28 text-naipe" /></div>
        </div>
        
        <div className="relative container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Zap, 
                title: 'Tiempo real', 
                desc: 'WebSocket. Sin lag. Cada carta al instante.',
                color: 'oro'
              },
              { 
                icon: Coins, 
                title: 'Pozos de equipo', 
                desc: 'Cada uno aporta. El equipo ganador reparte.',
                color: 'paño'
              },
              { 
                icon: Trophy, 
                title: 'Liga semanal', 
                desc: 'Ranking que se resetea. Racha y gloria.',
                color: 'celeste'
              },
              { 
                icon: Shield, 
                title: 'Anti-trampa', 
                desc: 'Todo validado en servidor. Imposible trucar.',
                color: 'naipe'
              },
            ].map((item, i) => (
              <div key={i} className="card-club p-6 group hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-club bg-${item.color}/10 border border-${item.color}/30 flex items-center justify-center mb-4`}>
                  <item.icon className={`w-6 h-6 text-${item.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-naipe mb-2">{item.title}</h3>
                <p className="text-sm text-naipe-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-noche-100 via-noche to-noche" />
        
        <div className="relative container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Wallet Preview */}
            <div className="card-club overflow-hidden">
              <div className="p-6 border-b border-paño/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-naipe flex items-center gap-2">
                    <Coins className="w-5 h-5 text-oro" />
                    Mis Fichas
                  </h3>
                  {session && (
                    <span className="chip">
                      {session.user.creditsBalance ?? 0}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                {session ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-club bg-noche-200 border border-oro/20">
                      <p className="text-4xl font-bold text-oro tabular-nums">
                        {session.user.creditsBalance ?? 0}
                      </p>
                      <p className="text-sm text-naipe-700">fichas disponibles</p>
                    </div>
                    <Link href="/fichas">
                      <Button className="w-full bg-oro/10 hover:bg-oro/20 text-oro border border-oro/30 rounded-club">
                        Ver movimientos
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-naipe-700 mb-4">Entrá para ver tus fichas</p>
                    <Link href="/login">
                      <Button variant="outline" className="border-paño/30 text-naipe-400 hover:bg-paño/10 rounded-club">
                        Entrar
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Ranking Preview */}
            <div className="card-club overflow-hidden">
              <div className="p-6 border-b border-paño/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-naipe flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-celeste" />
                    Top Semanal
                  </h3>
                  <Badge className="bg-paño/20 text-paño-50 border-paño/30">
                    <Timer className="w-3 h-3 mr-1" />
                    En vivo
                  </Badge>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {[
                    { pos: 1, name: 'ElTrucazo', wins: 47, streak: 8 },
                    { pos: 2, name: 'ManoNegra', wins: 42, streak: 5 },
                    { pos: 3, name: 'EnvidoKing', wins: 38, streak: 3 },
                  ].map((player) => (
                    <div 
                      key={player.pos}
                      className="flex items-center gap-3 p-3 rounded-club bg-noche-200 border border-paño/10 hover:border-paño/30 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        player.pos === 1 ? 'bg-oro/20 text-oro' :
                        player.pos === 2 ? 'bg-naipe-600/20 text-naipe-500' :
                        'bg-oro-muted/20 text-oro-muted'
                      }`}>
                        {player.pos}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-naipe text-sm">{player.name}</p>
                        <p className="text-xs text-naipe-700">{player.wins} victorias</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-oro">
                        <Flame className="w-3 h-3" />
                        {player.streak}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Link href="/rankings" className="block mt-4">
                  <Button variant="ghost" className="w-full text-celeste hover:text-celeste-light hover:bg-celeste/10 rounded-club">
                    Ver tabla completa
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Community Preview */}
            <div className="card-club overflow-hidden">
              <div className="p-6 border-b border-paño/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-naipe flex items-center gap-2">
                    <Users className="w-5 h-5 text-paño-50" />
                    Comunidad
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-paño animate-pulse" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {[
                    { cat: 'BUSCO_EQUIPO', text: 'Busco equipo 3v3 con pozo', user: 'TrucoPro', color: 'paño' },
                    { cat: 'TIP', text: 'Siempre cantá envido con 28+', user: 'ElMaestro', color: 'oro' },
                    { cat: 'PARTIDA', text: 'Épica victoria con contraflor!', user: 'LaRevancha', color: 'celeste' },
                  ].map((post, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-club bg-noche-200 border border-paño/10 hover:border-paño/30 transition-colors"
                    >
                      <Badge className={`bg-${post.color}/10 text-${post.color} border-${post.color}/30 text-[10px] mb-2`}>
                        {post.cat.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-naipe-300 line-clamp-1">{post.text}</p>
                      <p className="text-xs text-naipe-700 mt-1">@{post.user}</p>
                    </div>
                  ))}
                </div>
                
                <Link href="/comunidad" className="block mt-4">
                  <Button variant="ghost" className="w-full text-paño-50 hover:text-paño-100 hover:bg-paño/10 rounded-club">
                    Ver comunidad
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesa-radial opacity-20" />
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-oro/10 border border-oro/30 mb-8">
              <Sparkles className="w-4 h-4 text-oro" />
              <span className="text-sm text-oro font-medium">Fichas de bienvenida incluidas</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-naipe mb-6 tracking-tight">
              CREÁ TU CUENTA
              <br />
              <span className="text-gradient-oro">Y ARRANCÁ HOY</span>
            </h2>
            <p className="text-naipe-600 mb-10 max-w-xl mx-auto text-lg">
              En 30 segundos estás adentro. 
              Empezá gratis o directamente con fichas para el pozo.
            </p>
            
            {session ? (
              <Link href="/jugar">
                <Button className="btn-oro text-lg px-12 py-7 group">
                  <Swords className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Ir a jugar
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button className="btn-oro text-lg px-10 py-6">
                    Crear cuenta gratis
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-naipe-700 text-naipe-400 hover:bg-noche-100 px-8 py-6">
                    Ya tengo cuenta
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-paño/20 bg-noche">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-club bg-paño flex items-center justify-center">
                <EspadaSVG className="w-4 h-5 text-naipe" />
              </div>
              <span className="text-sm text-naipe-700">Truco Argentino © 2026</span>
            </div>
            
            <p className="text-sm text-naipe-800">
              Hecho por Doro
            </p>
            
            <div className="flex items-center gap-6">
              <Link href="/soporte" className="text-sm text-naipe-700 hover:text-naipe transition-colors">
                Soporte
              </Link>
              <Link href="/soporte#faq" className="text-sm text-naipe-700 hover:text-naipe transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
