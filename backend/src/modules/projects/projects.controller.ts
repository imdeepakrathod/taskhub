import type { Request, Response } from 'express'

import { ForbiddenError } from '../../common/errors/httpErrors.js'

import type { CreateProjectInput, UpdateProjectInput } from './projects.schema.js'
import {
  createProject,
  getProject,
  listProjects,
  removeProject,
  updateProject,
} from './projects.service.js'

type CreateProjectRequest = Request<Record<string, string>, unknown, CreateProjectInput>
type UpdateProjectRequest = Request<Record<string, string>, unknown, UpdateProjectInput>

export async function createProjectController(
  req: CreateProjectRequest,
  res: Response,
): Promise<void> {
  if (!req.user || !req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const project = await createProject(req.membership.workspaceId, req.user.id, req.body)

  res.status(201).json({
    status: 'success',
    data: { project },
  })
}

export async function listProjectsController(req: Request, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const projects = await listProjects(req.membership.workspaceId)

  res.status(200).json({
    status: 'success',
    data: { projects },
  })
}

export async function getProjectController(req: Request, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const projectId = req.params.projectId as string
  const project = await getProject(projectId, req.membership.workspaceId)

  res.status(200).json({
    status: 'success',
    data: { project },
  })
}

export async function updateProjectController(
  req: UpdateProjectRequest,
  res: Response,
): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const projectId = req.params.projectId as string
  const project = await updateProject(projectId, req.membership.workspaceId, req.body)

  res.status(200).json({
    status: 'success',
    data: { project },
  })
}

export async function deleteProjectController(req: Request, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const projectId = req.params.projectId as string
  await removeProject(projectId, req.membership.workspaceId)

  res.status(204).send()
}
