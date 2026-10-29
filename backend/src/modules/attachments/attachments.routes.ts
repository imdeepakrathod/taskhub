import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizeTaskAccess } from '../../middlewares/authorize.js'
import { uploadAttachment } from '../../middlewares/upload.js'

import {
  deleteTaskAttachmentController,
  listTaskAttachmentsController,
  uploadTaskAttachmentController,
} from './attachments.controller.js'

const attachmentsRouter = Router({ mergeParams: true })

// All attachment endpoints require authentication & membership access to the task's workspace
attachmentsRouter.use(authenticate, authorizeTaskAccess())

attachmentsRouter.get('/', asyncHandler(listTaskAttachmentsController))

attachmentsRouter.post(
  '/',
  uploadAttachment.single('file'),
  asyncHandler(uploadTaskAttachmentController),
)

attachmentsRouter.delete('/:attachmentId', asyncHandler(deleteTaskAttachmentController))

export default attachmentsRouter
