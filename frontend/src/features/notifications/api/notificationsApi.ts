import { api } from '../../../lib/axios'
import type { NotificationsResponse } from '../types'

export async function fetchNotifications(workspaceId: string): Promise<NotificationsResponse> {
  const response = await api.get<{ data: NotificationsResponse }>(
    `/workspaces/${workspaceId}/notifications`,
  )
  return response.data.data
}

export async function markNotificationAsRead(
  workspaceId: string,
  notificationId: string,
): Promise<void> {
  await api.patch(`/workspaces/${workspaceId}/notifications/${notificationId}/read`)
}

export async function markAllNotificationsAsRead(workspaceId: string): Promise<void> {
  await api.patch(`/workspaces/${workspaceId}/notifications/read-all`)
}
