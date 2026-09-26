import type { RequestHandler } from 'express'

import type { WorkspaceRole } from '../generated/prisma/client.js'

import { ForbiddenError, UnauthorizedError } from '../common/errors/httpErrors.js'
import { prisma } from '../config/database.js'

export function authorizeWorkspaceMember(requiredRoles?: WorkspaceRole[]): RequestHandler {
  return async (req, _res, next) => {
    try {
      if (!req.user) {
        next(new UnauthorizedError('Authentication required', 'UNAUTHENTICATED'))

        return
      }

      const workspaceId = req.params.workspaceId

      if (!workspaceId || typeof workspaceId !== 'string') {
        next(new ForbiddenError('Workspace not found', 'WORKSPACE_NOT_FOUND'))

        return
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: req.user.id,
          },
        },
        select: {
          role: true,
        },
      })

      if (!membership) {
        next(
          new ForbiddenError('You are not a member of this workspace', 'WORKSPACE_ACCESS_DENIED'),
        )

        return
      }

      if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(membership.role)) {
        next(new ForbiddenError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS'))

        return
      }

      req.membership = {
        workspaceId,
        role: membership.role,
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
