import { api } from '../../../lib/axios'
import type { ApiSuccess } from '../../auth/types'
import type { ActivityLog } from '../types'

export async function fetchProjectActivities(projectId: string): Promise<ActivityLog[]> {
  const response = await api.get<ApiSuccess<{ activities: ActivityLog[] }>>(
    `/projects/${projectId}/activity`,
  )

  return response.data.data.activities
}

export async function fetchWorkspaceActivities(workspaceId: string): Promise<ActivityLog[]> {
  const response = await api.get<ApiSuccess<{ activities: ActivityLog[] }>>(
    `/workspaces/${workspaceId}/activity`,
  )

  return response.data.data.activities
}
