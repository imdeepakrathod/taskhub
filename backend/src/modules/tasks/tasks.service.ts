import { BadRequestError, NotFoundError } from '../../common/errors/httpErrors.js'
import { prisma } from '../../config/database.js'

import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from './tasks.schema.js'
import {
  createTask as createTaskInDb,
  deleteTaskById,
  findTaskById,
  findTasksByProjectId,
  getNextTaskPosition,
  updateTaskById,
} from './tasks.repository.js'

function throwTaskNotFound(): never {
  throw new NotFoundError('Task not found', 'TASK_NOT_FOUND')
}

async function validateAssigneeInWorkspace(assigneeId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: assigneeId,
      },
    },
  })

  if (!membership) {
    throw new BadRequestError(
      'Assignee must be a member of the workspace',
      'ASSIGNEE_NOT_IN_WORKSPACE',
    )
  }
}

export async function createTask(projectId: string, workspaceId: string, input: CreateTaskInput) {
  if (input.assigneeId) {
    await validateAssigneeInWorkspace(input.assigneeId, workspaceId)
  }

  const nextPosition = await getNextTaskPosition(projectId)

  return createTaskInDb({
    ...input,
    projectId,
    position: nextPosition,
  })
}

export async function listTasks(projectId: string, filters: ListTasksQuery) {
  return findTasksByProjectId(projectId, filters)
}

export async function getTask(taskId: string, projectId: string) {
  const task = await findTaskById(taskId, projectId)

  if (!task) {
    throwTaskNotFound()
  }

  return task
}

export async function updateTask(
  taskId: string,
  projectId: string,
  workspaceId: string,
  input: UpdateTaskInput,
) {
  const existingTask = await findTaskById(taskId, projectId)

  if (!existingTask) {
    throwTaskNotFound()
  }

  if (input.assigneeId) {
    await validateAssigneeInWorkspace(input.assigneeId, workspaceId)
  }

  return updateTaskById(taskId, input)
}

export async function removeTask(taskId: string, projectId: string) {
  const existingTask = await findTaskById(taskId, projectId)

  if (!existingTask) {
    throwTaskNotFound()
  }

  await deleteTaskById(taskId)
}
