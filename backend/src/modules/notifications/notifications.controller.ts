import type { Request, Response } from 'express'

import * as notificationsService from './notifications.service.js'

export async function listNotificationsController(req: Request, res: Response) {
  const { workspaceId } = req.params
  const userId = req.user!.id

  const data = await notificationsService.getUserNotifications(userId, workspaceId as string)

  res.status(200).json({
    data,
  })
}

export async function markNotificationAsReadController(req: Request, res: Response) {
  const { notificationId } = req.params
  const userId = req.user!.id

  await notificationsService.markAsRead(notificationId as string, userId)

  res.status(204).send()
}

export async function markAllNotificationsAsReadController(req: Request, res: Response) {
  const { workspaceId } = req.params
  const userId = req.user!.id

  await notificationsService.markAllAsRead(userId, workspaceId as string)

  res.status(204).send()
}
