import type { TaskPriority, TaskStatus } from '../../generated/prisma/client.js'

import { prisma } from '../../config/database.js'

type CreateTaskData = {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  position: number
  dueDate?: Date | null
  projectId: string
  assigneeId?: string | null
}

type UpdateTaskData = {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  position?: number
  dueDate?: Date | null
  assigneeId?: string | null
}

type TaskFilters = {
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string
}

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  position: true,
  dueDate: true,
  projectId: true,
  assigneeId: true,
  createdAt: true,
  updatedAt: true,
  assignee: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
}

export async function getNextTaskPosition(projectId: string): Promise<number> {
  const lastTask = await prisma.task.findFirst({
    where: { projectId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  return lastTask ? lastTask.position + 1 : 0
}

export async function createTask(data: CreateTaskData) {
  return prisma.task.create({
    data,
    select: taskSelect,
  })
}

export async function findTasksByProjectId(projectId: string, filters: TaskFilters = {}) {
  return prisma.task.findMany({
    where: {
      projectId,
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    select: taskSelect,
  })
}

export async function findTaskById(taskId: string, projectId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
    },
    select: taskSelect,
  })
}

export async function updateTaskById(taskId: string, data: UpdateTaskData) {
  return prisma.task.update({
    where: { id: taskId },
    data,
    select: taskSelect,
  })
}

export async function deleteTaskById(taskId: string) {
  return prisma.task.delete({
    where: { id: taskId },
  })
}
