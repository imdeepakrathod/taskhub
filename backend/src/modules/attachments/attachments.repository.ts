import { prisma } from '../../config/database.js'

export interface CreateAttachmentInput {
  taskId: string
  uploaderId: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
}

export async function createAttachment(data: CreateAttachmentInput) {
  return prisma.attachment.create({
    data,
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function findAttachmentById(id: string) {
  return prisma.attachment.findUnique({
    where: { id },
    include: {
      task: {
        select: {
          id: true,
          projectId: true,
          project: {
            select: {
              workspaceId: true,
            },
          },
        },
      },
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function listAttachmentsByTaskId(taskId: string) {
  return prisma.attachment.findMany({
    where: { taskId },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function deleteAttachment(id: string) {
  return prisma.attachment.delete({
    where: { id },
  })
}
