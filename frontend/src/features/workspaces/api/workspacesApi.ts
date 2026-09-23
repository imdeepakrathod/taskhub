import { api } from '../../../lib/axios'
import type { ApiSuccess } from '../../auth/types'
import type { CreateWorkspaceInput, Workspace } from '../types'

export async function fetchWorkspaces(): Promise<Workspace[]> {
  const response = await api.get<ApiSuccess<{ workspaces: Workspace[] }>>('/workspaces')

  return response.data.data.workspaces
}

export async function createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
  const response = await api.post<ApiSuccess<{ workspace: Workspace }>>('/workspaces', input)

  return response.data.data.workspace
}
