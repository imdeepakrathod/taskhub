import { BadRequestError, NotFoundError } from '../../common/errors/httpErrors.js'
import { prisma } from '../../config/database.js'
import { logActivity } from '../activity/activity.repository.js'

import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from './tasks.schema.js'
import {
  createTask as createTaskInDb,
  deleteTaskById,
  findTaskById,
  findTasksByProjectId,
  getNextTaskPosition,
  updateTaskById,
} from './tasks.repository.js'

export async function createTask(
  projectId: string,
  workspaceId: string,
  userId: string,
  input: CreateTaskInput,
) {
  if (input.assigneeId) {
    const isMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: input.assigneeId,
        },
      },
    })

    if (!isMember) {
      throw new BadRequestError(
        'Assignee must be a member of the workspace',
        'ASSIGNEE_NOT_IN_WORKSPACE',
      )
    }
  }

  const position = await getNextTaskPosition(projectId)

  const task = await createTaskInDb({
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate,
    position,
    projectId,
    assigneeId: input.assigneeId,
  })

  // Audit log
  await logActivity({
    workspaceId,
    projectId,
    actorId: userId,
    action: 'TASK_CREATED',
    entityType: 'TASK',
    entityId: task.id,
    metadata: {
      taskTitle: task.title,
      status: task.status,
      priority: task.priority,
    },
  })

  return task
}

export async function listTasks(projectId: string, query: ListTasksQuery) {
  return findTasksByProjectId(projectId, query)
}

export async function getTask(taskId: string, projectId: string) {
  const task = await findTaskById(taskId, projectId)

  if (!task) {
    throw new NotFoundError('Task not found', 'TASK_NOT_FOUND')
  }

  return task
}

export async function updateTask(
  taskId: string,
  projectId: string,
  workspaceId: string,
  userId: string,
  input: UpdateTaskInput,
) {
  const task = await findTaskById(taskId, projectId)

  if (!task) {
    throw new NotFoundError('Task not found', 'TASK_NOT_FOUND')
  }

  if (input.assigneeId) {
    const isMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: input.assigneeId,
        },
      },
    })

    if (!isMember) {
      throw new BadRequestError(
        'Assignee must be a member of the workspace',
        'ASSIGNEE_NOT_IN_WORKSPACE',
      )
    }
  }

  const updatedTask = await updateTaskById(taskId, input)

  // Determine specific audit action
  if (input.status && input.status !== task.status) {
    await logActivity({
      workspaceId,
      projectId,
      actorId: userId,
      action: 'TASK_STATUS_CHANGED',
      entityType: 'TASK',
      entityId: taskId,
      metadata: {
        taskTitle: updatedTask.title,
        oldStatus: task.status,
        newStatus: input.status,
      },
    })
  } else if (input.priority && input.priority !== task.priority) {
    await logActivity({
      workspaceId,
      projectId,
      actorId: userId,
      action: 'TASK_PRIORITY_CHANGED',
      entityType: 'TASK',
      entityId: taskId,
      metadata: {
        taskTitle: updatedTask.title,
        oldPriority: task.priority,
        newPriority: input.priority,
      },
    })
  } else if (input.assigneeId !== undefined && input.assigneeId !== task.assigneeId) {
    await logActivity({
      workspaceId,
      projectId,
      actorId: userId,
      action: 'TASK_ASSIGNEE_CHANGED',
      entityType: 'TASK',
      entityId: taskId,
      metadata: {
        taskTitle: updatedTask.title,
        assigneeName: updatedTask.assignee?.name ?? 'Unassigned',
      },
    })
  } else {
    await logActivity({
      workspaceId,
      projectId,
      actorId: userId,
      action: 'TASK_UPDATED',
      entityType: 'TASK',
      entityId: taskId,
      metadata: {
        taskTitle: updatedTask.title,
      },
    })
  }

  return updatedTask
}

export async function removeTask(
  taskId: string,
  projectId: string,
  workspaceId: string,
  userId: string,
) {
  const task = await findTaskById(taskId, projectId)

  if (!task) {
    throw new NotFoundError('Task not found', 'TASK_NOT_FOUND')
  }

  await deleteTaskById(taskId)

  await logActivity({
    workspaceId,
    projectId,
    actorId: userId,
    action: 'TASK_DELETED',
    entityType: 'TASK',
    entityId: taskId,
    metadata: {
      taskTitle: task.title,
    },
  })
}
