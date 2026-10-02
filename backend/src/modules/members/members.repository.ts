import type { WorkspaceRole } from '../../generated/prisma/client.js'

import { prisma } from '../../config/database.js'

const memberSelect = {
  id: true,
  role: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
}

export async function findMembersByWorkspace(workspaceId: string) {
  return prisma.workspaceMember.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'asc' },
    select: memberSelect,
  })
}

export async function findMemberById(memberId: string, workspaceId: string) {
  return prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId },
    select: memberSelect,
  })
}

export async function findMemberByUserId(workspaceId: string, userId: string) {
  return prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId },
    },
    select: memberSelect,
  })
}

export async function addMember(workspaceId: string, userId: string, role: WorkspaceRole) {
  return prisma.workspaceMember.create({
    data: { workspaceId, userId, role },
    select: memberSelect,
  })
}

export async function updateMemberRole(memberId: string, role: WorkspaceRole) {
  return prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role },
    select: memberSelect,
  })
}

export async function removeMember(memberId: string) {
  return prisma.workspaceMember.delete({
    where: { id: memberId },
  })
}
