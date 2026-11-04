import type { NotificationType } from '../../generated/prisma/client.js'
import { emitToUser } from '../../config/socket.js'
import * as notificationsRepo from './notifications.repository.js'

export async function sendNotification(input: {
  userId: string
  actorId: string
  workspaceId: string
  type: NotificationType
  title: string
  message: string
  entityId: string
}) {
  // Never notify oneself
  if (input.userId === input.actorId) {
    return null
  }

  const notification = await notificationsRepo.createNotification(input)

  // Real-time instant push via private user room
  try {
    emitToUser(input.userId, 'notification:received', notification)
  } catch (error) {
    console.error('Failed to emit notification socket event:', error)
  }

  return notification
}

export async function getUserNotifications(userId: string, workspaceId: string) {
  const [notifications, unreadCount] = await Promise.all([
    notificationsRepo.listNotificationsByUserId(userId, workspaceId),
    notificationsRepo.countUnreadNotifications(userId, workspaceId),
  ])

  return { notifications, unreadCount }
}

export async function markAsRead(id: string, userId: string) {
  await notificationsRepo.markNotificationAsRead(id, userId)
}

export async function markAllAsRead(userId: string, workspaceId: string) {
  await notificationsRepo.markAllNotificationsAsRead(userId, workspaceId)
}
