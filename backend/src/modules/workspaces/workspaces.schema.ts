import { z } from 'zod'

export const createWorkspaceBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Workspace name must contain at least 2 characters')
      .max(100, 'Workspace name cannot exceed 100 characters'),
  })
  .strict()

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceBodySchema>
