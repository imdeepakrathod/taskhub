import { api } from '../../../lib/axios'
import type { Attachment } from '../types'

export async function fetchAttachments(taskId: string): Promise<Attachment[]> {
  const response = await api.get<{ data: Attachment[] }>(`/tasks/${taskId}/attachments`)
  return response.data.data
}

export async function uploadAttachment(taskId: string, file: File): Promise<Attachment> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<{ data: Attachment }>(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data.data
}

export async function deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`)
}
