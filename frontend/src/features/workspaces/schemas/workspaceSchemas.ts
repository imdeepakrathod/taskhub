import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Workspace name must contain at least 2 characters')
    .max(100, 'Workspace name cannot exceed 100 characters'),
})

export type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>
