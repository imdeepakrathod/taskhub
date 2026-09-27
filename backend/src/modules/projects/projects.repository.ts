import { prisma } from '../../config/database.js'

type CreateProjectData = {
  name: string
  description?: string
  workspaceId: string
  createdById: string
}

type UpdateProjectData = {
  name?: string
  description?: string | null
}

const projectSelect = {
  id: true,
  name: true,
  description: true,
  workspaceId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
}

export async function createProject(data: CreateProjectData) {
  return prisma.project.create({
    data,
    select: projectSelect,
  })
}

export async function findProjectsByWorkspace(workspaceId: string) {
  return prisma.project.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    select: projectSelect,
  })
}

export async function findProjectById(projectId: string, workspaceId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId,
    },
    select: projectSelect,
  })
}

export async function updateProjectById(projectId: string, data: UpdateProjectData) {
  return prisma.project.update({
    where: { id: projectId },
    data,
    select: projectSelect,
  })
}

export async function deleteProjectById(projectId: string) {
  return prisma.project.delete({
    where: { id: projectId },
  })
}
