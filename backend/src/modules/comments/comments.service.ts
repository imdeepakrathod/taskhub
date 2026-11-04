import { ForbiddenError, NotFoundError } from '../../common/errors/httpErrors.js'
import { prisma } from '../../config/database.js'
import { logActivity } from '../activity/activity.repository.js'

import type { CreateCommentInput } from './comments.schema.js'
import {
  createComment as createCommentInDb,
  deleteCommentById,
  findCommentById,
  findCommentsByTaskId,
} from './comments.repository.js'
import { sendNotification } from '../notifications/notifications.service.js'

export async function createComment(taskId: string, authorId: string, input: CreateCommentInput) {
  const comment = await createCommentInDb(taskId, authorId, input.content)

  // Fetch task context for audit logging & notifications
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      title: true,
      projectId: true,
      assigneeId: true, // 👈 Added assigneeId
      project: { select: { workspaceId: true } },
    },
  })

  if (task) {
    await logActivity({
      workspaceId: task.project.workspaceId,
      projectId: task.projectId,
      actorId: authorId,
      action: 'COMMENT_CREATED',
      entityType: 'COMMENT',
      entityId: comment.id,
      metadata: {
        taskTitle: task.title,
        preview: input.content.length > 60 ? `${input.content.slice(0, 60)}...` : input.content,
      },
    })

    // Notify task assignee if someone else comments on their task
    if (task.assigneeId && task.assigneeId !== authorId) {
      void sendNotification({
        userId: task.assigneeId,
        actorId: authorId,
        workspaceId: task.project.workspaceId,
        type: 'COMMENT_ADDED',
        title: 'New Comment',
        message: `${comment.author.name} commented on your assigned task: "${task.title}"`,
        entityId: taskId,
      })
    }
  }

  return comment
}

export async function listComments(taskId: string) {
  return findCommentsByTaskId(taskId)
}

export async function removeComment(commentId: string, userId: string, userRole: string) {
  const comment = await findCommentById(commentId)

  if (!comment) {
    throw new NotFoundError('Comment not found', 'COMMENT_NOT_FOUND')
  }

  const isAuthor = comment.authorId === userId
  const isModerator = userRole === 'OWNER' || userRole === 'ADMIN'

  if (!isAuthor && !isModerator) {
    throw new ForbiddenError('You can only delete your own comments', 'COMMENT_DELETE_FORBIDDEN')
  }

  await deleteCommentById(commentId)
}
