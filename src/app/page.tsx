'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  Gamepad2, 
  Trophy, 
  Coins, 
  Shield, 
  Users,
  Zap,
  ChevronRight,
  Star,
  Clock
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400 font-medium">Modo competitivo disponible</span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                Truco Argentino
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Online
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Jugá partidas competitivas con stake por equipos. 
              Armá tu equipo, apostá fichas y ganá premios reales.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/jugar">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg px-8 py-6 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
                >
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Jugar Ahora
                </Button>
              </Link>
              <Link href="/rankings">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-lg px-8 py-6"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Ver Rankings
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 sm:gap-16 mt-16">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white">1v1</p>
                <p className="text-sm text-slate-500">Mano a mano</p>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white">2v2</p>
                <p className="text-sm text-slate-500">Duplas</p>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white">3v3</p>
                <p className="text-sm text-slate-500">Equipos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Todo lo que necesitás</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Una plataforma completa para el Truco Argentino más competitivo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-amber-500/30 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-all">
                  <Gamepad2 className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Partidas en Vivo</h3>
                <p className="text-sm text-slate-400">
                  Jugá en tiempo real con conexión WebSocket. Sin lag, sin cortes.
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 2 */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-amber-500/30 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all">
                  <Coins className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Stake por Equipos</h3>
                <p className="text-sm text-slate-400">
                  Sistema TEAM_POOL: cada jugador aporta, el equipo ganador reparte.
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 3 */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-amber-500/30 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-4 group-hover:from-purple-500/30 group-hover:to-violet-500/30 transition-all">
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Rankings Competitivos</h3>
                <p className="text-sm text-slate-400">
                  Subí en el ranking semanal y global. Demostrá quién manda.
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 4 */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-amber-500/30 transition-all group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Anti-Trampas</h3>
                <p className="text-sm text-slate-400">
                  Validación server-side de cada jugada. Imposible hacer trampa.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Wallet Preview */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-400" />
                    Mis Fichas
                  </h3>
                  {session && (
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                      {session.user.creditsBalance ?? 0} fichas
                    </Badge>
                  )}
                </div>
                
                {session ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <p className="text-3xl font-bold text-amber-400">
                        {session.user.creditsBalance ?? 0}
                      </p>
                      <p className="text-sm text-slate-500">Fichas disponibles</p>
                    </div>
                    <Link href="/fichas">
                      <Button className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Ver Movimientos
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-500 mb-4">Iniciá sesión para ver tus fichas</p>
                    <Link href="/login">
                      <Button variant="outline" className="border-slate-700">
                        Iniciar Sesión
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Ranking Preview */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-purple-400" />
                    Top Semanal
                  </h3>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                    <Clock className="w-3 h-3 mr-1" />
                    En vivo
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {[
                    { pos: 1, name: 'ElTrucazo', wins: 47, icon: '🥇' },
                    { pos: 2, name: 'ManoNegra', wins: 42, icon: '🥈' },
                    { pos: 3, name: 'EnvidoKing', wins: 38, icon: '🥉' },
                  ].map((player) => (
                    <div 
                      key={player.pos}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
                    >
                      <span className="text-xl">{player.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{player.name}</p>
                        <p className="text-xs text-slate-500">{player.wins} victorias</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Link href="/rankings" className="block mt-4">
                  <Button variant="ghost" className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
                    Ver Ranking Completo
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Community Preview */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Comunidad
                  </h3>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                    Activo
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {[
                    { cat: 'BUSCO_EQUIPO', text: 'Busco equipo para 3v3 con stake', user: 'TrucoPro', time: '5m' },
                    { cat: 'TIP', text: 'Siempre cantar envido con 28+', user: 'ElMaestro', time: '12m' },
                    { cat: 'PARTIDA', text: 'Épica victoria con contraflor!', user: 'LaRevancha', time: '18m' },
                  ].map((post, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-700/50">
                          {post.cat.replace('_', ' ')}
                        </Badge>
                        <span className="text-[10px] text-slate-500">{post.time}</span>
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-1">{post.text}</p>
                      <p className="text-xs text-slate-500 mt-1">@{post.user}</p>
                    </div>
                  ))}
                </div>
                
                <Link href="/comunidad" className="block mt-4">
                  <Button variant="ghost" className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                    Ver Comunidad
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-3xl blur-3xl" />
            
            <div className="relative bg-slate-900/80 border border-slate-800 rounded-3xl p-8 lg:p-12 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-400">Gratis para empezar</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                ¿Listo para jugar?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Creá tu cuenta en segundos y empezá a jugar. 
                Recibí fichas de bienvenida para tu primera partida con stake.
              </p>
              
              {session ? (
                <Link href="/jugar">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-12"
                  >
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Ir a Jugar
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-12"
                  >
                    Crear Cuenta Gratis
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">T</span>
              </div>
              <span className="text-sm text-slate-500">Truco Argentino © 2026</span>
            </div>
            
            <p className="text-sm text-slate-600">
              Hecho x doro
            </p>
            
            <div className="flex items-center gap-6">
              <Link href="/soporte" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                Soporte
              </Link>
              <Link href="/soporte#faq" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
