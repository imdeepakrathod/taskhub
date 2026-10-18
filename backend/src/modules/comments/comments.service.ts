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

export async function createComment(taskId: string, authorId: string, input: CreateCommentInput) {
  const comment = await createCommentInDb(taskId, authorId, input.content)

  // Fetch task context for audit logging
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { title: true, projectId: true, project: { select: { workspaceId: true } } },
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
