import { z } from 'zod'

export const searchQuerySchema = z
  .object({
    q: z.string().trim().min(1, 'Search query cannot be empty').max(100, 'Search query too long'),
  })
  .strict()

export type SearchQueryInput = z.infer<typeof searchQuerySchema>
