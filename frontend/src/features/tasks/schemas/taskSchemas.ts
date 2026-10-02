import { z } from 'zod'

export const taskStatusEnum = z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
export const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(500, 'Title cannot exceed 500 characters'),
  description: z.string().trim().optional(),
  status: taskStatusEnum,
  priority: taskPriorityEnum,
})

export type CreateTaskFormData = z.infer<typeof createTaskSchema>
