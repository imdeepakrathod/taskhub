import { api } from '../../../lib/axios'
import type { ApiSuccess } from '../../auth/types'
import type { CreateTaskInput, Task, UpdateTaskInput } from '../types'

export async function fetchTasks(projectId: string): Promise<Task[]> {
  const response = await api.get<ApiSuccess<{ tasks: Task[] }>>(`/projects/${projectId}/tasks`)

  return response.data.data.tasks
}

export async function createTask(projectId: string, input: CreateTaskInput): Promise<Task> {
  const response = await api.post<ApiSuccess<{ task: Task }>>(`/projects/${projectId}/tasks`, input)

  return response.data.data.task
}

export async function updateTask(
  projectId: string,
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const response = await api.patch<ApiSuccess<{ task: Task }>>(
    `/projects/${projectId}/tasks/${taskId}`,
    input,
  )

  return response.data.data.task
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/tasks/${taskId}`)
}
