'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Credenciales inválidas')
        return
      }

      toast.success('¡Bienvenido!')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-green-800/90 to-green-900/90 border-green-700 backdrop-blur">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">🎴</div>
          <CardTitle className="text-2xl text-white">Iniciar Sesión</CardTitle>
          <CardDescription className="text-green-200">
            Ingresá a tu cuenta para jugar al Truco
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
            <p className="text-green-200 text-sm text-center">
              ¿No tenés cuenta?{' '}
              <Link href="/register" className="text-amber-400 hover:underline">
                Registrate
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

