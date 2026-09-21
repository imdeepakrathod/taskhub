import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(255, 'Email cannot exceed 255 characters'),

  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password cannot exceed 128 characters'),
})

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must contain at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),

  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(255, 'Email cannot exceed 255 characters'),

  password: z
    .string()
    .min(12, 'Password must contain at least 12 characters')
    .max(128, 'Password cannot exceed 128 characters'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export type RegisterFormValues = z.infer<typeof registerSchema>
