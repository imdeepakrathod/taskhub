import type { Request, Response } from 'express'

import { BadRequestError } from '../../common/errors/httpErrors.js'
import * as attachmentsService from './attachments.service.js'

export async function listTaskAttachmentsController(req: Request, res: Response) {
  const { taskId } = req.params
  const attachments = await attachmentsService.getTaskAttachments(taskId as string)

  res.status(200).json({
    data: attachments,
  })
}

export async function uploadTaskAttachmentController(req: Request, res: Response) {
  const { taskId } = req.params

  if (!req.file) {
    throw new BadRequestError('No file provided for upload', 'NO_FILE_UPLOADED')
  }

  const attachment = await attachmentsService.uploadTaskAttachment(
    taskId as string,
    req.user!.id,
    req.file,
  )

  res.status(201).json({
    data: attachment,
  })
}

export async function deleteTaskAttachmentController(req: Request, res: Response) {
  const { attachmentId } = req.params

  await attachmentsService.removeAttachment(
    attachmentId as string,
    req.user!.id,
    req.membership?.role,
  )

  res.status(204).send()
}
