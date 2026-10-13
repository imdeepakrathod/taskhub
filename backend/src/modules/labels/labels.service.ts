import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors/httpErrors.js'
import { prisma } from '../../config/database.js'

import type { AttachLabelInput, CreateLabelInput } from './labels.schema.js'
import {
  attachLabelToTask as attachInDb,
  createLabel as createInDb,
  deleteLabelById,
  detachLabelFromTask as detachInDb,
  findLabelById,
  findLabelsByWorkspace,
  findTaskLabel,
} from './labels.repository.js'

export async function listWorkspaceLabels(workspaceId: string) {
  return findLabelsByWorkspace(workspaceId)
}

export async function createWorkspaceLabel(workspaceId: string, input: CreateLabelInput) {
  const existing = await prisma.label.findUnique({
    where: {
      workspaceId_name: {
        workspaceId,
        name: input.name,
      },
    },
  })

  if (existing) {
    throw new ConflictError(
      'A label with this name already exists in this workspace',
      'LABEL_ALREADY_EXISTS',
    )
  }

  return createInDb(workspaceId, input.name, input.color)
}

export async function removeWorkspaceLabel(labelId: string, workspaceId: string) {
  const label = await findLabelById(labelId)

  if (!label || label.workspaceId !== workspaceId) {
    throw new NotFoundError('Label not found', 'LABEL_NOT_FOUND')
  }

  await deleteLabelById(labelId)
}

export async function attachLabel(taskId: string, input: AttachLabelInput) {
  // Check if already attached
  const existing = await findTaskLabel(taskId, input.labelId)

  if (existing) {
    throw new ConflictError('Label is already attached to this task', 'LABEL_ALREADY_ATTACHED')
  }

  // Verify label belongs to the same workspace as the task
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { project: { select: { workspaceId: true } } },
  })

  const label = await findLabelById(input.labelId)

  if (!task || !label || task.project.workspaceId !== label.workspaceId) {
    throw new BadRequestError('Label does not belong to this workspace', 'LABEL_MISMATCH')
  }

  return attachInDb(taskId, input.labelId)
}

export async function detachLabel(taskId: string, labelId: string) {
  const existing = await findTaskLabel(taskId, labelId)

  if (!existing) {
    throw new NotFoundError('Label is not attached to this task', 'LABEL_NOT_ATTACHED')
  }

  await detachInDb(taskId, labelId)
}
