import { WorkspaceRole } from '../../generated/prisma/client.js'

import { prisma } from '../../config/database.js'

type CreateWorkspaceWithOwnerData = {
  name: string
  slug: string
  ownerId: string
}

export async function createWorkspaceWithOwner(data: CreateWorkspaceWithOwnerData) {
  return prisma.$transaction(async (transaction) => {
    const workspace = await transaction.workspace.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const membership = await transaction.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: data.ownerId,
        role: WorkspaceRole.OWNER,
      },
      select: {
        role: true,
      },
    })

    return {
      ...workspace,
      role: membership.role,
    }
  })
}
