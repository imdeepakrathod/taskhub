import { z } from 'zod'

export const createProjectBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Project name is required')
      .max(200, 'Project name cannot exceed 200 characters'),

    description: z
      .string()
      .trim()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional(),
  })
  .strict()

export const updateProjectBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Project name is required')
      .max(200, 'Project name cannot exceed 200 characters')
      .optional(),

    description: z
      .string()
      .trim()
      .max(2000, 'Description cannot exceed 2000 characters')
      .nullable()
      .optional(),
  })
  .strict()

export type CreateProjectInput = z.infer<typeof createProjectBodySchema>
export type UpdateProjectInput = z.infer<typeof updateProjectBodySchema>
