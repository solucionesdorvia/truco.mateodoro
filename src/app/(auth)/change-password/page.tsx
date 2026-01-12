'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validations/auth'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al cambiar la contraseña')
        return
      }

      // Update session to reflect password change
      await update({ mustChangePassword: false })

      toast.success('¡Contraseña actualizada!')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Error al cambiar la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-amber-800/90 to-amber-900/90 border-amber-700 backdrop-blur">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">🔐</div>
          <CardTitle className="text-2xl text-white">Cambiar Contraseña</CardTitle>
          <CardDescription className="text-amber-200">
            {session?.user?.mustChangePassword
              ? 'Debés cambiar tu contraseña antes de continuar'
              : 'Actualizá tu contraseña de acceso'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-amber-100">Contraseña Actual</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                className="bg-amber-950/50 border-amber-600 text-white placeholder:text-amber-400/50"
                {...register('currentPassword')}
              />
              {errors.currentPassword && (
                <p className="text-red-400 text-sm">{errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-amber-100">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                className="bg-amber-950/50 border-amber-600 text-white placeholder:text-amber-400/50"
                {...register('newPassword')}
              />
              {errors.newPassword && (
                <p className="text-red-400 text-sm">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="text-amber-100">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="••••••••"
                className="bg-amber-950/50 border-amber-600 text-white placeholder:text-amber-400/50"
                {...register('confirmNewPassword')}
              />
              {errors.confirmNewPassword && (
                <p className="text-red-400 text-sm">{errors.confirmNewPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

