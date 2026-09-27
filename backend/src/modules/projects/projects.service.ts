import { NotFoundError } from '../../common/errors/httpErrors.js'

import type { CreateProjectInput, UpdateProjectInput } from './projects.schema.js'
import {
  createProject as createProjectInDb,
  deleteProjectById,
  findProjectById,
  findProjectsByWorkspace,
  updateProjectById,
} from './projects.repository.js'

function throwProjectNotFound(): never {
  throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND')
}

export async function createProject(
  workspaceId: string,
  createdById: string,
  input: CreateProjectInput,
) {
  return createProjectInDb({
    name: input.name,
    description: input.description,
    workspaceId,
    createdById,
  })
}

export async function listProjects(workspaceId: string) {
  return findProjectsByWorkspace(workspaceId)
}

export async function getProject(projectId: string, workspaceId: string) {
  const project = await findProjectById(projectId, workspaceId)

  if (!project) {
    throwProjectNotFound()
  }

  return project
}

export async function updateProject(
  projectId: string,
  workspaceId: string,
  input: UpdateProjectInput,
) {
  const project = await findProjectById(projectId, workspaceId)

  if (!project) {
    throwProjectNotFound()
  }

  return updateProjectById(projectId, input)
}

export async function removeProject(projectId: string, workspaceId: string) {
  const project = await findProjectById(projectId, workspaceId)

  if (!project) {
    throwProjectNotFound()
  }

  await deleteProjectById(projectId)
}
