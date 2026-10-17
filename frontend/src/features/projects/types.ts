export type Project = {
  id: string
  name: string
  description: string | null
  workspaceId: string
  createdById: string
  createdAt: string
  updatedAt: string
}

export type CreateProjectInput = {
  name: string
  description?: string
}

export type ProjectAnalytics = {
  totalTasks: number
  completedTasks: number
  completionPercentage: number
  tasksByStatus: {
    BACKLOG: number
    TODO: number
    IN_PROGRESS: number
    IN_REVIEW: number
    DONE: number
  }
  tasksByPriority: {
    LOW: number
    MEDIUM: number
    HIGH: number
    URGENT: number
  }
  workload: {
    userId: string | null
    name: string
    email: string
    count: number
  }[]
}
