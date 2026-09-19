import type { Request, Response } from 'express'

import { UnauthorizedError } from '../../common/errors/httpErrors.js'

import type { CreateWorkspaceInput } from './workspaces.schema.js'
import { createWorkspace } from './workspaces.service.js'

type CreateWorkspaceRequest = Request<Record<string, never>, unknown, CreateWorkspaceInput>

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
