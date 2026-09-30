export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  position: number
  dueDate: string | null
  projectId: string
  assigneeId: string | null
  createdAt: string
  updatedAt: string
  assignee?: {
    id: string
    name: string
    email: string
  } | null
}

export type CreateTaskInput = {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  assigneeId?: string | null
}

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  position?: number
}
