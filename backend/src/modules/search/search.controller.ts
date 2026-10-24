import type { Request, Response } from 'express'

import { ForbiddenError } from '../../common/errors/httpErrors.js'

import { searchWorkspace } from './search.service.js'

export async function searchWorkspaceController(req: Request, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const query = (req.query.q as string) || ''
  const results = await searchWorkspace(req.membership.workspaceId, query)

  res.status(200).json({
    status: 'success',
    data: results,
  })
}
