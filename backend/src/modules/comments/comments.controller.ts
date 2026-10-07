import type { Request, Response } from 'express'

import { ForbiddenError } from '../../common/errors/httpErrors.js'

import type { CreateCommentInput } from './comments.schema.js'
import { createComment, listComments, removeComment } from './comments.service.js'

type CreateCommentRequest = Request<Record<string, string>, unknown, CreateCommentInput>

export async function createCommentController(
  req: CreateCommentRequest,
  res: Response,
): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const taskId = req.params.taskId as string
  const comment = await createComment(taskId, req.user.id, req.body)

  res.status(201).json({
    status: 'success',
    data: { comment },
  })
}

export async function listCommentsController(req: Request, res: Response): Promise<void> {
  const taskId = req.params.taskId as string
  const comments = await listComments(taskId)

  res.status(200).json({
    status: 'success',
    data: { comments },
  })
}

export async function deleteCommentController(req: Request, res: Response): Promise<void> {
  if (!req.user || !req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const commentId = req.params.commentId as string
  await removeComment(commentId, req.user.id, req.membership.role)

  res.status(204).send()
}
