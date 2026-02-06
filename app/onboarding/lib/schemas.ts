import { z } from 'zod'

export const intentSchema = z.object({
  intent: z.enum(['host', 'guest']),
})

export const identitySchema = z.object({
  username: z
    .string()
    .min(3, 'Al menos 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-z0-9_-]+$/, 'Solo minúsculas, números, guiones y guiones bajos'),
  display_name: z.string().min(1, 'Ingresá tu nombre').max(50),
  city: z.string().min(1, 'Ingresá tu ciudad'),
  country: z.string().min(1, 'Seleccioná un país'),
})

export const spaceSchema = z.object({
  accommodation_type: z.enum(['room', 'sofa', 'airbed', 'other']),
  bio: z.string().max(300).optional(),
})

export const conditionsSchema = z.object({
  default_payment_type: z.enum(['free', 'friend_price', 'favor', 'service']),
  default_price: z.number().min(0).nullable().optional(),
  default_favor_text: z.string().max(300).nullable().optional(),
  default_presence: z.enum(['home', 'empty', 'shared']).nullable().optional(),
})

export type IntentForm = z.infer<typeof intentSchema>
export type IdentityForm = z.infer<typeof identitySchema>
export type SpaceForm = z.infer<typeof spaceSchema>
export type ConditionsForm = z.infer<typeof conditionsSchema>
