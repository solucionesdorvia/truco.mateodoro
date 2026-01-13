'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'

// Logo SVG
function TrucoLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor">
      <path d="M16 2C16 2 12 8 12 12C12 14.5 13.5 16.5 16 17C18.5 16.5 20 14.5 20 12C20 8 16 2 16 2Z" />
      <path d="M16 17V28" strokeWidth="2.5" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <path d="M12 24H20" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

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

      toast.success('¡Cuenta creada! Ahora podés entrar')
      router.push('/login')
    } catch {
      toast.error('Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-noche flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-paño/10 rounded-full blur-[150px]" />
      <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdHRlcm4gaWQ9InBhdHRlcm4iIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIiBmaWxsPSIjZmZmIi8+CiAgPC9wYXR0ZXJuPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz4KPC9zdmc+')]" />
      
      <Card className="w-full max-w-md card-club border-0 relative">
        <CardHeader className="text-center pb-2">
          <Badge className="bg-oro/20 text-oro border-oro/30 mx-auto mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Fichas de bienvenida
          </Badge>
          <div className="w-16 h-16 rounded-club bg-oro/20 border border-oro/40 flex items-center justify-center mx-auto mb-4">
            <TrucoLogo className="w-8 h-8 text-oro" />
          </div>
          <CardTitle className="text-2xl text-naipe tracking-tight">CREAR CUENTA</CardTitle>
          <CardDescription className="text-naipe-600">
            Registrate para empezar a jugar
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-naipe-300 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-naipe-700" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="bg-noche-200 border-paño/20 text-naipe placeholder:text-naipe-700 pl-10 rounded-club"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-naipe-300 text-sm">Nombre de usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-naipe-700" />
                <Input
                  id="username"
                  placeholder="tu_usuario"
                  className="bg-noche-200 border-paño/20 text-naipe placeholder:text-naipe-700 pl-10 rounded-club"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-destructive text-xs">{errors.username.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-naipe-300 text-sm">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-naipe-700" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-noche-200 border-paño/20 text-naipe placeholder:text-naipe-700 pl-10 rounded-club"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-naipe-300 text-sm">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-naipe-700" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="bg-noche-200 border-paño/20 text-naipe placeholder:text-naipe-700 pl-10 rounded-club"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full btn-oro"
              disabled={isLoading}
            >
              {isLoading ? 'Creando cuenta...' : (
                <>
                  Crear cuenta
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            <p className="text-naipe-600 text-sm text-center">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="text-paño-50 hover:text-paño-100 transition-colors">
                Entrá
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
