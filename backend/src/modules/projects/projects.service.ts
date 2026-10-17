import { NotFoundError } from '../../common/errors/httpErrors.js'
import { prisma } from '../../config/database.js'

import type { CreateProjectInput, UpdateProjectInput } from './projects.schema.js'
import {
  createProject as createProjectInDb,
  deleteProjectById,
  findProjectById,
  findProjectsByWorkspace,
  updateProjectById,
} from './projects.repository.js'

export async function createProject(
  workspaceId: string,
  userId: string,
  input: CreateProjectInput,
) {
  return createProjectInDb({
    ...input,
    workspaceId,
    createdById: userId,
  })
}

export async function listProjects(workspaceId: string) {
  return findProjectsByWorkspace(workspaceId)
}

export async function getProject(projectId: string, workspaceId: string) {
  const project = await findProjectById(projectId, workspaceId)

  if (!project) {
    throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND')
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
    throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND')
  }

  return updateProjectById(projectId, input)
}

export async function removeProject(projectId: string, workspaceId: string) {
  const project = await findProjectById(projectId, workspaceId)

  if (!project) {
    throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND')
  }

  await deleteProjectById(projectId)
}

export async function getProjectAnalytics(projectId: string, workspaceId: string) {
  const project = await findProjectById(projectId, workspaceId)

  if (!project) {
    throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND')
  }

  // Group tasks by status
  const statusGroups = await prisma.task.groupBy({
    by: ['status'],
    where: { projectId },
    _count: { id: true },
  })

  // Group tasks by priority
  const priorityGroups = await prisma.task.groupBy({
    by: ['priority'],
    where: { projectId },
    _count: { id: true },
  })

  // Group tasks by assignee
  const assigneeGroups = await prisma.task.groupBy({
    by: ['assigneeId'],
    where: { projectId },
    _count: { id: true },
  })

  const totalTasks = statusGroups.reduce((acc, curr) => acc + curr._count.id, 0)
  const doneCount = statusGroups.find((s) => s.status === 'DONE')?._count.id ?? 0
  const completionPercentage = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0

  const tasksByStatus = {
    BACKLOG: 0,
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
  }
  for (const group of statusGroups) {
    tasksByStatus[group.status] = group._count.id
  }

  const tasksByPriority = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    URGENT: 0,
  }
  for (const group of priorityGroups) {
    tasksByPriority[group.priority] = group._count.id
  }

  // Populate user info for workload
  const assigneeIds = assigneeGroups
    .map((g) => g.assigneeId)
    .filter((id): id is string => Boolean(id))

  const users = await prisma.user.findMany({
    where: { id: { in: assigneeIds } },
    select: { id: true, name: true, email: true },
  })
  const userMap = new Map(users.map((u) => [u.id, u]))

  const workload = assigneeGroups.map((g) => {
    if (!g.assigneeId) {
      return {
        userId: null,
        name: 'Unassigned',
        email: '',
        count: g._count.id,
      }
    }
    const user = userMap.get(g.assigneeId)

    return {
      userId: g.assigneeId,
      name: user?.name ?? 'Unknown',
      email: user?.email ?? '',
      count: g._count.id,
    }
  })

  return {
    totalTasks,
    completedTasks: doneCount,
    completionPercentage,
    tasksByStatus,
    tasksByPriority,
    workload,
  }
}
