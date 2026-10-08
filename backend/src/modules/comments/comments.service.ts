import { ForbiddenError, NotFoundError } from '../../common/errors/httpErrors.js'

import type { CreateCommentInput } from './comments.schema.js'
import {
  createComment as createCommentInDb,
  deleteCommentById,
  findCommentById,
  findCommentsByTaskId,
} from './comments.repository.js'

export async function createComment(taskId: string, authorId: string, input: CreateCommentInput) {
  return createCommentInDb(taskId, authorId, input.content)
}

export async function listComments(taskId: string) {
  return findCommentsByTaskId(taskId)
}

export async function removeComment(commentId: string, userId: string, userRole: string) {
  const comment = await findCommentById(commentId)

  if (!comment) {
    throw new NotFoundError('Comment not found', 'COMMENT_NOT_FOUND')
  }

  // Author can always delete their own comment
  // OWNER and ADMIN can delete anyone's comment (moderation)
  const isAuthor = comment.authorId === userId
  const isModerator = userRole === 'OWNER' || userRole === 'ADMIN'

  if (!isAuthor && !isModerator) {
    throw new ForbiddenError('You can only delete your own comments', 'COMMENT_DELETE_FORBIDDEN')
  }

  await deleteCommentById(commentId)
}
