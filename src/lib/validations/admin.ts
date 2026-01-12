import { z } from 'zod'

export const loadCreditsSchema = z.object({
  userId: z.string().min(1, 'Usuario requerido'),
  amount: z.number().int().min(1, 'El monto debe ser al menos 1 crédito'),
  note: z.string().optional(),
})

export const adjustCreditsSchema = z.object({
  userId: z.string().min(1, 'Usuario requerido'),
  amount: z.number().int().refine(val => val !== 0, {
    message: 'El ajuste no puede ser 0',
  }),
  note: z.string().min(1, 'Se requiere un motivo para el ajuste'),
})

export const updatePlatformFeeSchema = z.object({
  platformFeePercent: z.number().int().min(0).max(50, 'La comisión no puede superar el 50%'),
})

export const searchUsersSchema = z.object({
  query: z.string().min(1, 'Búsqueda requerida'),
})

export type LoadCreditsInput = z.infer<typeof loadCreditsSchema>
export type AdjustCreditsInput = z.infer<typeof adjustCreditsSchema>
export type UpdatePlatformFeeInput = z.infer<typeof updatePlatformFeeSchema>
export type SearchUsersInput = z.infer<typeof searchUsersSchema>
