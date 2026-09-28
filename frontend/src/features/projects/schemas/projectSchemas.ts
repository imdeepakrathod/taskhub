import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(200, 'Project name cannot exceed 200 characters'),
  description: z.string().trim().max(2000, 'Description cannot exceed 2000 characters').optional(),
})

export type CreateProjectFormData = z.infer<typeof createProjectSchema>
