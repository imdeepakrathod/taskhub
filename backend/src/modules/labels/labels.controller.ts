import type { Request, Response } from 'express'

import { ForbiddenError } from '../../common/errors/httpErrors.js'

import type { AttachLabelInput, CreateLabelInput } from './labels.schema.js'
import {
  attachLabel,
  createWorkspaceLabel,
  detachLabel,
  listWorkspaceLabels,
  removeWorkspaceLabel,
} from './labels.service.js'

type CreateLabelRequest = Request<Record<string, string>, unknown, CreateLabelInput>
type AttachLabelRequest = Request<Record<string, string>, unknown, AttachLabelInput>

export async function listLabelsController(req: Request, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const labels = await listWorkspaceLabels(req.membership.workspaceId)

  res.status(200).json({
    status: 'success',
    data: { labels },
  })
}

export async function createLabelController(req: CreateLabelRequest, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const label = await createWorkspaceLabel(req.membership.workspaceId, req.body)

  res.status(201).json({
    status: 'success',
    data: { label },
  })
}

export async function deleteLabelController(req: Request, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const labelId = req.params.labelId as string
  await removeWorkspaceLabel(labelId, req.membership.workspaceId)

  res.status(204).send()
}

export async function attachLabelController(req: AttachLabelRequest, res: Response): Promise<void> {
  const taskId = req.params.taskId as string
  const taskLabel = await attachLabel(taskId, req.body)

  res.status(201).json({
    status: 'success',
    data: { taskLabel },
  })
}

export async function detachLabelController(req: Request, res: Response): Promise<void> {
  const taskId = req.params.taskId as string
  const labelId = req.params.labelId as string
  await detachLabel(taskId, labelId)

  res.status(204).send()
}
