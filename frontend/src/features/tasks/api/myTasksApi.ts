import { api } from '../../../lib/axios'
import type { ApiSuccess } from '../../auth/types'
import type { Task } from '../types'

export type MyTask = Task & {
  project: {
    id: string
    name: string
  }
}

export async function fetchMyTasks(workspaceId: string): Promise<MyTask[]> {
  const response = await api.get<ApiSuccess<{ tasks: MyTask[] }>>(
    `/workspaces/${workspaceId}/my-tasks`,
  )
  return response.data.data.tasks
}
