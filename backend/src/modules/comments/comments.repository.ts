import { prisma } from '../../config/database.js'

const commentSelect = {
  id: true,
  content: true,
  taskId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
}

export async function createComment(taskId: string, authorId: string, content: string) {
  return prisma.comment.create({
    data: { content, taskId, authorId },
    select: commentSelect,
  })
}

export async function findCommentsByTaskId(taskId: string) {
  return prisma.comment.findMany({
    where: { taskId },
    orderBy: { createdAt: 'asc' },
    select: commentSelect,
  })
}

export async function findCommentById(commentId: string) {
  return prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      ...commentSelect,
      authorId: true,
    },
  })
}

export async function deleteCommentById(commentId: string) {
  return prisma.comment.delete({
    where: { id: commentId },
  })
}
