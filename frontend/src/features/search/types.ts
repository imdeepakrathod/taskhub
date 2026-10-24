import type { TaskPriority, TaskStatus } from '../tasks/types'

export type SearchTaskResult = {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  project: {
    id: string
    name: string
  }
}

export type SearchProjectResult = {
  id: string
  name: string
  description: string | null
}

export type SearchResults = {
  tasks: SearchTaskResult[]
  projects: SearchProjectResult[]
}
