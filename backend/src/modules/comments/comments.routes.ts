import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizeTaskAccess } from '../../middlewares/authorize.js'
import { validateBody } from '../../middlewares/validate.js'

import {
  createCommentController,
  deleteCommentController,
  listCommentsController,
} from './comments.controller.js'
import { createCommentBodySchema } from './comments.schema.js'

const commentsRouter = Router({ mergeParams: true })

// All routes require authentication + workspace membership via task
commentsRouter.use(authenticate, authorizeTaskAccess())

commentsRouter.post(
  '/',
  validateBody(createCommentBodySchema),
  asyncHandler(createCommentController),
)

commentsRouter.get('/', asyncHandler(listCommentsController))

commentsRouter.delete('/:commentId', asyncHandler(deleteCommentController))

export default commentsRouter
