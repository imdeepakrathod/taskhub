import { prisma } from '../../config/database.js'

const labelSelect = {
  id: true,
  name: true,
  color: true,
  workspaceId: true,
  createdAt: true,
}

export async function findLabelsByWorkspace(workspaceId: string) {
  return prisma.label.findMany({
    where: { workspaceId },
    orderBy: { name: 'asc' },
    select: labelSelect,
  })
}

export async function findLabelById(labelId: string) {
  return prisma.label.findUnique({
    where: { id: labelId },
    select: labelSelect,
  })
}

export async function createLabel(workspaceId: string, name: string, color: string) {
  return prisma.label.create({
    data: { workspaceId, name, color },
    select: labelSelect,
  })
}

export async function deleteLabelById(labelId: string) {
  return prisma.label.delete({
    where: { id: labelId },
  })
}

export async function attachLabelToTask(taskId: string, labelId: string) {
  return prisma.taskLabel.create({
    data: { taskId, labelId },
    select: {
      id: true,
      taskId: true,
      label: {
        select: labelSelect,
      },
    },
  })
}

export async function detachLabelFromTask(taskId: string, labelId: string) {
  return prisma.taskLabel.delete({
    where: {
      taskId_labelId: { taskId, labelId },
    },
  })
}

export async function findTaskLabel(taskId: string, labelId: string) {
  return prisma.taskLabel.findUnique({
    where: {
      taskId_labelId: { taskId, labelId },
    },
  })
}
