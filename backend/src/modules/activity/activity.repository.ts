import type { Prisma } from '../../generated/prisma/client.js'
import type { ActivityAction } from '../../generated/prisma/client.js'

import { prisma } from '../../config/database.js'

const activitySelect = {
  id: true,
  action: true,
  entityType: true,
  entityId: true,
  metadata: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
}

export async function logActivity(data: {
  workspaceId: string
  projectId?: string | null
  actorId: string
  action: ActivityAction
  entityType: string
  entityId: string
  metadata?: Prisma.InputJsonValue
}) {
  return prisma.activityLog.create({
    data: {
      workspaceId: data.workspaceId,
      projectId: data.projectId ?? null,
      actorId: data.actorId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata ?? undefined,
    },
  })
}

export async function findActivitiesByProject(projectId: string, limit = 50) {
  return prisma.activityLog.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: activitySelect,
  })
}

export async function findActivitiesByWorkspace(workspaceId: string, limit = 50) {
  return prisma.activityLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: activitySelect,
  })
}
