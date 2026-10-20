import type { Request, Response } from 'express'

import { UnauthorizedError } from '../../common/errors/httpErrors.js'

import type { CreateWorkspaceInput, UpdateWorkspaceInput } from './workspaces.schema.js'
import {
  createWorkspace,
  listUserWorkspaces,
  removeWorkspace,
  updateWorkspace,
} from './workspaces.service.js'

type CreateWorkspaceRequest = Request<Record<string, never>, unknown, CreateWorkspaceInput>
type UpdateWorkspaceRequest = Request<Record<string, string>, unknown, UpdateWorkspaceInput>

export async function createWorkspaceController(
  req: CreateWorkspaceRequest,
  res: Response,
): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required', 'UNAUTHENTICATED')
  }

  const workspace = await createWorkspace(req.user.id, req.body)

  res.status(201).json({
    status: 'success',
    data: {
      workspace,
    },
  })
}

export async function listWorkspacesController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required', 'UNAUTHENTICATED')
  }

  const workspaces = await listUserWorkspaces(req.user.id)

  res.status(200).json({
    status: 'success',
    data: {
      workspaces,
    },
  })
}

export async function updateWorkspaceController(
  req: UpdateWorkspaceRequest,
  res: Response,
): Promise<void> {
  if (!req.membership) {
    throw new UnauthorizedError('Authentication required', 'UNAUTHENTICATED')
  }

  const workspaceId = req.params.workspaceId as string
  const workspace = await updateWorkspace(workspaceId, req.body)

  res.status(200).json({
    status: 'success',
    data: {
      workspace,
    },
  })
}

export async function deleteWorkspaceController(req: Request, res: Response): Promise<void> {
  if (!req.membership) {
    throw new UnauthorizedError('Authentication required', 'UNAUTHENTICATED')
  }

  const workspaceId = req.params.workspaceId as string
  await removeWorkspace(workspaceId)

  res.status(204).send()
}
