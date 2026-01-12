'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrucoCard } from '@/components/game/TrucoCard'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-950">
      {/* Header */}
      <header className="border-b border-green-800/50 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎴</div>
            <h1 className="text-2xl font-bold text-white font-serif">Truco Argentino</h1>
          </div>
          <nav className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="h-10 w-24 bg-green-800/50 animate-pulse rounded-md" />
            ) : session ? (
              <>
                <div className="flex items-center gap-2 text-green-200">
                  <span className="text-sm">Hola,</span>
                  <span className="font-semibold">{session.user?.username}</span>
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-300">
                    ${session.user?.creditsBalance ?? 0}
                  </Badge>
                </div>
                {session.user?.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="border-amber-500/50 text-amber-300 hover:bg-amber-500/20">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/api/auth/signout">
                  <Button variant="ghost" size="sm" className="text-green-300 hover:text-white">
                    Salir
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-green-200 hover:text-white">
                    Ingresar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4 font-serif">
            ¡Jugá al Truco Online!
          </h2>
          <p className="text-xl text-green-200 max-w-2xl mx-auto">
            Desafiá a tus amigos en partidas de Truco Argentino en tiempo real. 
            Envido, Truco, Flor y mucho más.
          </p>
        </div>

        {/* Decorative cards */}
        <div className="flex justify-center gap-4 mb-12">
          <div className="transform -rotate-12 hover:rotate-0 transition-transform duration-300">
            <TrucoCard number={1} suit="espada" size="lg" />
          </div>
          <div className="transform rotate-0 hover:scale-110 transition-transform duration-300">
            <TrucoCard number={7} suit="oro" size="lg" />
          </div>
          <div className="transform rotate-12 hover:rotate-0 transition-transform duration-300">
            <TrucoCard number={1} suit="basto" size="lg" />
          </div>
        </div>

        {/* Action cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-green-800/80 to-green-900/80 border-green-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                Crear Partida
              </CardTitle>
              <CardDescription className="text-green-200">
                Configurá tu sala y compartí los códigos con tus amigos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={session ? '/create' : '/login'}>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-6 text-lg">
                  Crear Nueva Partida
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-800/80 to-amber-900/80 border-amber-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Unirse a Partida
              </CardTitle>
              <CardDescription className="text-amber-200">
                Ingresá el código que te compartieron
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={session ? '/join' : '/login'}>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-6 text-lg">
                  Unirse con Código
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🃏</div>
            <h3 className="text-xl font-semibold text-white mb-2">Truco Completo</h3>
            <p className="text-green-200 text-sm">
              Envido, Truco, Retruco, Vale 4, Flor y todas las reglas argentinas
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-white mb-2">Sistema de Créditos</h3>
            <p className="text-green-200 text-sm">
              Jugá gratis o apostá créditos con el sistema de pozo por equipo
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">Tiempo Real</h3>
            <p className="text-green-200 text-sm">
              Partidas instantáneas con reconexión automática
            </p>
          </div>
        </div>

        {/* Game modes */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">Modos de Juego</h3>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge className="bg-green-600/50 text-green-100 text-lg px-6 py-2">
              1 vs 1
            </Badge>
            <Badge className="bg-green-600/50 text-green-100 text-lg px-6 py-2">
              2 vs 2
            </Badge>
            <Badge className="bg-green-600/50 text-green-100 text-lg px-6 py-2">
              3 vs 3
            </Badge>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-green-800/50 mt-16 py-8 text-center text-green-400 text-sm">
        <p>Truco Argentino Online - Hecho x doro</p>
      </footer>
    </div>
  )
}
