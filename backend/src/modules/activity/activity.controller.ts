import type { Request, Response } from 'express'

import { ForbiddenError } from '../../common/errors/httpErrors.js'

import { listProjectActivity, listWorkspaceActivity } from './activity.service.js'

export async function getProjectActivityController(req: Request, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const projectId = req.params.projectId as string
  const activities = await listProjectActivity(projectId)

  res.status(200).json({
    status: 'success',
    data: { activities },
  })
}

export async function getWorkspaceActivityController(req: Request, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const activities = await listWorkspaceActivity(req.membership.workspaceId)

  res.status(200).json({
    status: 'success',
    data: { activities },
  })
}
