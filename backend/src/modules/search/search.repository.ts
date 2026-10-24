import { prisma } from '../../config/database.js'

export async function searchWorkspaceEntities(workspaceId: string, query: string) {
  // Parallel search for Tasks and Projects within the active workspace
  const [tasks, projects] = await Promise.all([
    prisma.task.findMany({
      where: {
        project: {
          workspaceId,
        },
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        projectId: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.project.findMany({
      where: {
        workspaceId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
      },
    }),
  ])

  return { tasks, projects }
}
