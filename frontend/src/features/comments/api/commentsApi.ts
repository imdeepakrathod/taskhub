import { api } from '../../../lib/axios'
import type { ApiSuccess } from '../../auth/types'
import type { Comment } from '../types'

export async function fetchComments(taskId: string): Promise<Comment[]> {
  const response = await api.get<ApiSuccess<{ comments: Comment[] }>>(`/tasks/${taskId}/comments`)

  return response.data.data.comments
}

export async function createComment(taskId: string, content: string): Promise<Comment> {
  const response = await api.post<ApiSuccess<{ comment: Comment }>>(`/tasks/${taskId}/comments`, {
    content,
  })

  return response.data.data.comment
}

export async function deleteComment(taskId: string, commentId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}/comments/${commentId}`)
}
