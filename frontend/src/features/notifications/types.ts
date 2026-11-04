export type NotificationType = 'TASK_ASSIGNED' | 'COMMENT_ADDED'

export type Notification = {
  id: string
  userId: string
  actorId: string
  workspaceId: string
  type: NotificationType
  title: string
  message: string
  entityId: string // taskId
  read: boolean
  createdAt: string
  actor: {
    id: string
    name: string
    email: string
  }
}

export type NotificationsResponse = {
  notifications: Notification[]
  unreadCount: number
}
