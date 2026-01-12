'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CreateGamePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const [config, setConfig] = useState({
    mode: 'TWO_VS_TWO',
    targetScore: 15,
    florEnabled: false,
    chatEnabled: true,
    timerEnabled: false,
    timerSeconds: 25,
    stakeMode: 'NONE',
    entryFeeCredits: 1,
    stakeTotalCredits: 100,
    payoutMode: 'PROPORTIONAL',
  })

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-950 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const handleCreate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al crear la partida')
        return
      }

      toast.success('¡Partida creada!')
      router.push(`/lobby/${result.room.id}?code=${result.room.codeTeamA}`)
    } catch {
      toast.error('Error al crear la partida')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-950 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Card className="bg-gradient-to-br from-green-800/90 to-green-900/90 border-green-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <span>🎮</span> Crear Partida
            </CardTitle>
            <CardDescription className="text-green-200">
              Configurá tu partida de Truco Argentino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode */}
            <div className="space-y-2">
              <Label className="text-green-100">Modo de Juego</Label>
              <Select
                value={config.mode}
                onValueChange={(value) => setConfig({ ...config, mode: value })}
              >
                <SelectTrigger className="bg-green-950/50 border-green-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONE_VS_ONE">1 vs 1 (2 jugadores)</SelectItem>
                  <SelectItem value="TWO_VS_TWO">2 vs 2 (4 jugadores)</SelectItem>
                  <SelectItem value="THREE_VS_THREE">3 vs 3 (6 jugadores)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Score */}
            <div className="space-y-2">
              <Label className="text-green-100">Puntos para ganar</Label>
              <Select
                value={config.targetScore.toString()}
                onValueChange={(value) => setConfig({ ...config, targetScore: parseInt(value) })}
              >
                <SelectTrigger className="bg-green-950/50 border-green-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 puntos</SelectItem>
                  <SelectItem value="30">30 puntos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Switches */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-green-950/30 rounded-lg">
                <Label className="text-green-100">Flor</Label>
                <Switch
                  checked={config.florEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, florEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-950/30 rounded-lg">
                <Label className="text-green-100">Chat</Label>
                <Switch
                  checked={config.chatEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, chatEnabled: checked })}
                />
              </div>
            </div>

            {/* Timer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-950/30 rounded-lg">
                <Label className="text-green-100">Timer por turno</Label>
                <Switch
                  checked={config.timerEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, timerEnabled: checked })}
                />
              </div>
              {config.timerEnabled && (
                <div className="pl-4">
                  <Label className="text-green-200 text-sm">Segundos por turno</Label>
                  <Input
                    type="number"
                    min={10}
                    max={120}
                    value={config.timerSeconds}
                    onChange={(e) => setConfig({ ...config, timerSeconds: parseInt(e.target.value) || 25 })}
                    className="mt-1 bg-green-950/50 border-green-600 text-white w-24"
                  />
                </div>
              )}
            </div>

            {/* Stake Mode */}
            <div className="space-y-3 pt-4 border-t border-green-700">
              <Label className="text-green-100 text-lg">💰 Economía</Label>
              <Select
                value={config.stakeMode}
                onValueChange={(value) => setConfig({ ...config, stakeMode: value })}
              >
                <SelectTrigger className="bg-green-950/50 border-green-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Gratis (sin créditos)</SelectItem>
                  <SelectItem value="ENTRY_FEE">Entrada fija por jugador</SelectItem>
                  <SelectItem value="TEAM_POOL">Pozo por equipo</SelectItem>
                </SelectContent>
              </Select>

              {config.stakeMode === 'ENTRY_FEE' && (
                <div className="space-y-2 pl-4">
                  <Label className="text-green-200 text-sm">Créditos de entrada</Label>
                  <Input
                    type="number"
                    min={1}
                    value={config.entryFeeCredits}
                    onChange={(e) => setConfig({ ...config, entryFeeCredits: parseInt(e.target.value) || 1 })}
                    className="bg-green-950/50 border-green-600 text-white w-32"
                  />
                </div>
              )}

              {config.stakeMode === 'TEAM_POOL' && (
                <div className="space-y-4 pl-4">
                  <div className="space-y-2">
                    <Label className="text-green-200 text-sm">Créditos totales por equipo</Label>
                    <Input
                      type="number"
                      min={1}
                      value={config.stakeTotalCredits}
                      onChange={(e) => setConfig({ ...config, stakeTotalCredits: parseInt(e.target.value) || 100 })}
                      className="bg-green-950/50 border-green-600 text-white w-32"
                    />
                    <p className="text-green-400 text-xs">
                      Cada equipo debe reunir este monto entre sus jugadores
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-green-200 text-sm">Modo de pago</Label>
                    <Select
                      value={config.payoutMode}
                      onValueChange={(value) => setConfig({ ...config, payoutMode: value })}
                    >
                      <SelectTrigger className="bg-green-950/50 border-green-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROPORTIONAL">Proporcional al aporte</SelectItem>
                        <SelectItem value="SINGLE_RECEIVER">Un solo receptor</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-green-400 text-xs">
                      {config.payoutMode === 'PROPORTIONAL'
                        ? 'El premio se reparte según el % aportado por cada jugador'
                        : 'Todo el premio va a un jugador designado'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="border-green-600 text-green-200 hover:bg-green-800/50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isLoading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
            >
              {isLoading ? 'Creando...' : 'Crear Partida'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

