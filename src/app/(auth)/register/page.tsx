'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al registrarse')
        return
      }

      toast.success('¡Cuenta creada! Ahora podés iniciar sesión')
      router.push('/login')
    } catch {
      toast.error('Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-green-800/90 to-green-900/90 border-green-700 backdrop-blur">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">🎴</div>
          <CardTitle className="text-2xl text-white">Crear Cuenta</CardTitle>
          <CardDescription className="text-green-200">
            Registrate para empezar a jugar al Truco
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-100">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="bg-green-950/50 border-green-600 text-white placeholder:text-green-400/50"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-green-100">Nombre de usuario</Label>
              <Input
                id="username"
                placeholder="tu_usuario"
                className="bg-green-950/50 border-green-600 text-white placeholder:text-green-400/50"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-red-400 text-sm">{errors.username.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-100">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-green-950/50 border-green-600 text-white placeholder:text-green-400/50"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-green-100">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="bg-green-950/50 border-green-600 text-white placeholder:text-green-400/50"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
            <p className="text-green-200 text-sm text-center">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="text-amber-400 hover:underline">
                Iniciá sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

