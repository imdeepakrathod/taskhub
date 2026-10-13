import { api } from '../../../lib/axios'
import type { ApiSuccess } from '../../auth/types'
import type { CreateLabelInput, Label } from '../types'

export async function fetchWorkspaceLabels(workspaceId: string): Promise<Label[]> {
  const response = await api.get<ApiSuccess<{ labels: Label[] }>>(
    `/workspaces/${workspaceId}/labels`,
  )

  return response.data.data.labels
}

export async function createWorkspaceLabel(
  workspaceId: string,
  input: CreateLabelInput,
): Promise<Label> {
  const response = await api.post<ApiSuccess<{ label: Label }>>(
    `/workspaces/${workspaceId}/labels`,
    input,
  )

  return response.data.data.label
}

export async function deleteWorkspaceLabel(workspaceId: string, labelId: string): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/labels/${labelId}`)
}

export async function attachLabelToTask(taskId: string, labelId: string): Promise<void> {
  await api.post(`/tasks/${taskId}/labels`, { labelId })
}

export async function detachLabelFromTask(taskId: string, labelId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}/labels/${labelId}`)
}
