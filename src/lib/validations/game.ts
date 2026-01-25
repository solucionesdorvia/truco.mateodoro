import { z } from 'zod'

export const gameModeSchema = z.enum(['ONE_VS_ONE', 'TWO_VS_TWO', 'THREE_VS_THREE'])
export const stakeModeSchema = z.enum(['NONE', 'ENTRY_FEE', 'TEAM_POOL'])
export const payoutModeSchema = z.enum(['PROPORTIONAL', 'SINGLE_RECEIVER'])

const minEntryByMode: Record<z.infer<typeof gameModeSchema>, number> = {
  ONE_VS_ONE: 2000,
  TWO_VS_TWO: 5000,
  THREE_VS_THREE: 9000,
}

export const createRoomSchema = z.object({
  mode: gameModeSchema,
  targetScore: z.number().refine(val => val === 15 || val === 30, {
    message: 'El puntaje objetivo debe ser 15 o 30',
  }),
  florEnabled: z.boolean(),
  chatEnabled: z.boolean(),
  timerEnabled: z.boolean(),
  timerSeconds: z.number().min(10).max(120).default(25),
  isPublic: z.boolean().optional().default(true),
  stakeMode: stakeModeSchema,
  entryFeeCredits: z.number().min(1).optional(),
  stakeTotalCredits: z.number().min(1).optional(),
  payoutMode: payoutModeSchema.default('PROPORTIONAL'),
}).refine((data) => {
  if (data.stakeMode === 'ENTRY_FEE' && !data.entryFeeCredits) {
    return false
  }
  return true
}, {
  message: 'Se requiere el monto de entrada para el modo ENTRY_FEE',
  path: ['entryFeeCredits'],
}).refine((data) => {
  if (data.stakeMode !== 'ENTRY_FEE' || !data.entryFeeCredits) {
    return true
  }
  return data.entryFeeCredits >= minEntryByMode[data.mode]
}, {
  message: 'El monto mínimo depende del modo de juego',
  path: ['entryFeeCredits'],
}).refine((data) => {
  if (data.stakeMode === 'TEAM_POOL' && !data.stakeTotalCredits) {
    return false
  }
  return true
}, {
  message: 'Se requiere el monto total de stake por equipo para el modo TEAM_POOL',
  path: ['stakeTotalCredits'],
})

export const joinRoomSchema = z.object({
  code: z.string().min(1, 'El código es requerido').length(8, 'El código debe tener 8 caracteres'),
})

export const stakeContributionSchema = z.object({
  roomId: z.string(),
  amount: z.number().min(0, 'El aporte no puede ser negativo'),
})

export const chatMessageSchema = z.object({
  roomId: z.string(),
  message: z.string().min(1).max(500),
})

export type CreateRoomInput = z.infer<typeof createRoomSchema>
export type JoinRoomInput = z.infer<typeof joinRoomSchema>
export type StakeContributionInput = z.infer<typeof stakeContributionSchema>
export type ChatMessageInput = z.infer<typeof chatMessageSchema>
