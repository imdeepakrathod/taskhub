import type { Request, Response } from 'express'

import { ForbiddenError } from '../../common/errors/httpErrors.js'

import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from './tasks.schema.js'
import { createTask, getTask, listTasks, removeTask, updateTask } from './tasks.service.js'

type CreateTaskRequest = Request<Record<string, string>, unknown, CreateTaskInput>
type UpdateTaskRequest = Request<Record<string, string>, unknown, UpdateTaskInput>
type ListTasksRequest = Request<Record<string, string>, unknown, unknown, ListTasksQuery>

export async function createTaskController(req: CreateTaskRequest, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const projectId = req.params.projectId as string
  const task = await createTask(projectId, req.membership.workspaceId, req.body)

  res.status(201).json({
    status: 'success',
    data: { task },
  })
}

export async function listTasksController(req: ListTasksRequest, res: Response): Promise<void> {
  const projectId = req.params.projectId as string
  const tasks = await listTasks(projectId, req.query)

  res.status(200).json({
    status: 'success',
    data: { tasks },
  })
}

export async function getTaskController(req: Request, res: Response): Promise<void> {
  const projectId = req.params.projectId as string
  const taskId = req.params.taskId as string
  const task = await getTask(taskId, projectId)

  res.status(200).json({
    status: 'success',
    data: { task },
  })
}

export async function updateTaskController(req: UpdateTaskRequest, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const projectId = req.params.projectId as string
  const taskId = req.params.taskId as string
  const task = await updateTask(taskId, projectId, req.membership.workspaceId, req.body)

  res.status(200).json({
    status: 'success',
    data: { task },
  })
}

export async function deleteTaskController(req: Request, res: Response): Promise<void> {
  const projectId = req.params.projectId as string
  const taskId = req.params.taskId as string
  await removeTask(taskId, projectId)

  res.status(204).send()
}
