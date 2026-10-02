import { z } from 'zod'

export const addMemberBodySchema = z
  .object({
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    role: z.enum(['ADMIN', 'MEMBER']).optional(),
  })
  .strict()

export const updateMemberRoleBodySchema = z
  .object({
    role: z.enum(['ADMIN', 'MEMBER']),
  })
  .strict()

export type AddMemberInput = z.infer<typeof addMemberBodySchema>
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleBodySchema>
