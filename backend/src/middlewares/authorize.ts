import type { RequestHandler } from 'express'

import type { WorkspaceRole } from '../generated/prisma/client.js'

import { ForbiddenError, NotFoundError, UnauthorizedError } from '../common/errors/httpErrors.js'
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

export function authorizeProjectMember(requiredRoles?: WorkspaceRole[]): RequestHandler {
  return async (req, _res, next) => {
    try {
      if (!req.user) {
        next(new UnauthorizedError('Authentication required', 'UNAUTHENTICATED'))

        return
      }

      const projectId = req.params.projectId

      if (!projectId || typeof projectId !== 'string') {
        next(new NotFoundError('Project not found', 'PROJECT_NOT_FOUND'))

        return
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { workspaceId: true },
      })

      if (!project) {
        next(new NotFoundError('Project not found', 'PROJECT_NOT_FOUND'))

        return
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: project.workspaceId,
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
        workspaceId: project.workspaceId,
        role: membership.role,
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

export function authorizeTaskAccess(requiredRoles?: WorkspaceRole[]): RequestHandler {
  return async (req, _res, next) => {
    try {
      if (!req.user) {
        next(new UnauthorizedError('Authentication required', 'UNAUTHENTICATED'))

        return
      }

      const taskId = req.params.taskId

      if (!taskId || typeof taskId !== 'string') {
        next(new NotFoundError('Task not found', 'TASK_NOT_FOUND'))

        return
      }

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
          project: {
            select: { workspaceId: true },
          },
        },
      })

      if (!task) {
        next(new NotFoundError('Task not found', 'TASK_NOT_FOUND'))

        return
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: task.project.workspaceId,
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
        workspaceId: task.project.workspaceId,
        role: membership.role,
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
