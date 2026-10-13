import { z } from 'zod'

// Regex matching 6-character hex colors like #EF4444 or #3B82F6
const hexColorRegex = /^#([0-9a-fA-F]{6})$/

export const createLabelBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Label name is required')
      .max(50, 'Label name cannot exceed 50 characters'),
    color: z
      .string()
      .trim()
      .regex(hexColorRegex, 'Color must be a valid 6-character hex code (e.g. #EF4444)'),
  })
  .strict()

export const attachLabelBodySchema = z
  .object({
    labelId: z.string().uuid('Invalid label ID'),
  })
  .strict()

export type CreateLabelInput = z.infer<typeof createLabelBodySchema>
export type AttachLabelInput = z.infer<typeof attachLabelBodySchema>
