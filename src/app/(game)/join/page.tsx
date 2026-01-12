'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function JoinGamePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

  const handleJoin = async () => {
    if (!code.trim()) {
      toast.error('Ingresá un código')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al unirse')
        return
      }

      toast.success(result.alreadyJoined ? 'Ya estás en esta sala' : '¡Te uniste a la partida!')
      router.push(`/lobby/${result.roomId}`)
    } catch {
      toast.error('Error al unirse a la partida')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-amber-800/90 to-amber-900/90 border-amber-700">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">🎯</div>
          <CardTitle className="text-2xl text-white">Unirse a Partida</CardTitle>
          <CardDescription className="text-amber-200">
            Ingresá el código que te compartieron
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-amber-100">Código de sala</Label>
            <Input
              id="code"
              placeholder="ABCD1234"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              className="bg-amber-950/50 border-amber-600 text-white placeholder:text-amber-400/50 text-center text-2xl tracking-widest font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
            <p className="text-amber-300 text-xs text-center">
              El código tiene 8 caracteres
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            onClick={handleJoin}
            disabled={isLoading || code.length !== 8}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            {isLoading ? 'Uniéndose...' : 'Unirse'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-amber-200 hover:text-white"
          >
            Volver
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

