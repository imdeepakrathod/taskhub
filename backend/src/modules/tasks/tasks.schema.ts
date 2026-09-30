import { z } from 'zod'

export const taskStatusEnum = z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
export const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])

export const createTaskBodySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Task title is required')
      .max(500, 'Task title cannot exceed 500 characters'),
    description: z.string().trim().optional(),
    status: taskStatusEnum.optional(),
    priority: taskPriorityEnum.optional(),
    dueDate: z.coerce.date().nullable().optional(),
    assigneeId: z.string().uuid('Invalid assignee ID').nullable().optional(),
  })
  .strict()

export const updateTaskBodySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Task title is required')
      .max(500, 'Task title cannot exceed 500 characters')
      .optional(),
    description: z.string().trim().nullable().optional(),
    status: taskStatusEnum.optional(),
    priority: taskPriorityEnum.optional(),
    position: z.number().int().min(0).optional(),
    dueDate: z.coerce.date().nullable().optional(),
    assigneeId: z.string().uuid('Invalid assignee ID').nullable().optional(),
  })
  .strict()

export const listTasksQuerySchema = z
  .object({
    status: taskStatusEnum.optional(),
    priority: taskPriorityEnum.optional(),
    assigneeId: z.string().uuid('Invalid assignee ID').optional(),
  })
  .strict()

export type CreateTaskInput = z.infer<typeof createTaskBodySchema>
export type UpdateTaskInput = z.infer<typeof updateTaskBodySchema>
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>
