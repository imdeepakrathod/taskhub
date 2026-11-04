import type { NotificationType } from '../../generated/prisma/client.js'
import { prisma } from '../../config/database.js'

export interface CreateNotificationInput {
  userId: string
  actorId: string
  workspaceId: string
  type: NotificationType
  title: string
  message: string
  entityId: string
}

export async function createNotification(data: CreateNotificationInput) {
  return prisma.notification.create({
    data,
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function listNotificationsByUserId(userId: string, workspaceId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      workspaceId,
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 30,
  })
}

export async function countUnreadNotifications(userId: string, workspaceId: string) {
  return prisma.notification.count({
    where: {
      userId,
      workspaceId,
      read: false,
    },
  })
}

export async function markNotificationAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      read: true,
    },
  })
}

export async function markAllNotificationsAsRead(userId: string, workspaceId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      workspaceId,
      read: false,
    },
    data: {
      read: true,
    },
  })
}
