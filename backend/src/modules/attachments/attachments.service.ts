import fs from 'node:fs'
import path from 'node:path'

import { ForbiddenError, NotFoundError } from '../../common/errors/httpErrors.js'
import { getSocketServer } from '../../config/socket.js'
import { prisma } from '../../config/database.js'
import * as attachmentsRepo from './attachments.repository.js'

export async function getTaskAttachments(taskId: string) {
  return attachmentsRepo.listAttachmentsByTaskId(taskId)
}

export async function uploadTaskAttachment(
  taskId: string,
  uploaderId: string,
  file: Express.Multer.File,
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true },
  })

  if (!task) {
    throw new NotFoundError('Task not found', 'TASK_NOT_FOUND')
  }

  // File relative URL path served by Express static server
  const fileUrl = `/uploads/${file.filename}`

  const attachment = await attachmentsRepo.createAttachment({
    taskId,
    uploaderId,
    fileName: file.originalname,
    fileUrl,
    fileSize: file.size,
    mimeType: file.mimetype,
  })

  // Broadcast real-time update to project room
  try {
    const io = getSocketServer()
    if (io) {
      io.to(`project:${task.projectId}`).emit('task:attachment:created', {
        taskId,
        attachment,
      })
    }
  } catch (error) {
    console.error('Failed to emit task:attachment:created socket event:', error)
  }

  return attachment
}

export async function removeAttachment(
  attachmentId: string,
  currentUserId: string,
  currentUserRole?: string,
) {
  const attachment = await attachmentsRepo.findAttachmentById(attachmentId)

  if (!attachment) {
    throw new NotFoundError('Attachment not found', 'ATTACHMENT_NOT_FOUND')
  }

  // RBAC: Only the file uploader OR workspace OWNER/ADMIN can delete an attachment
  const isOwnerOrAdmin = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN'
  const isUploader = attachment.uploaderId === currentUserId

  if (!isUploader && !isOwnerOrAdmin) {
    throw new ForbiddenError(
      'You do not have permission to delete this attachment',
      'INSUFFICIENT_PERMISSIONS',
    )
  }

  // Delete from database
  await attachmentsRepo.deleteAttachment(attachmentId)

  // Clean up physical file from disk
  const filename = path.basename(attachment.fileUrl)
  const filePath = path.resolve(process.cwd(), 'uploads', filename)
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete physical file from disk:', err)
    })
  }

  // Broadcast real-time deletion
  try {
    const io = getSocketServer()
    if (io) {
      io.to(`project:${attachment.task.projectId}`).emit('task:attachment:deleted', {
        taskId: attachment.taskId,
        attachmentId,
      })
    }
  } catch (error) {
    console.error('Failed to emit task:attachment:deleted socket event:', error)
  }
}
