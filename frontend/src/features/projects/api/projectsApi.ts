import { api } from '../../../lib/axios'
import type { ApiSuccess } from '../../auth/types'
import type { CreateProjectInput, Project } from '../types'

export async function fetchProjects(workspaceId: string): Promise<Project[]> {
  const response = await api.get<ApiSuccess<{ projects: Project[] }>>(
    `/workspaces/${workspaceId}/projects`,
  )

  return response.data.data.projects
}

export async function createProject(
  workspaceId: string,
  input: CreateProjectInput,
): Promise<Project> {
  const response = await api.post<ApiSuccess<{ project: Project }>>(
    `/workspaces/${workspaceId}/projects`,
    input,
  )

  return response.data.data.project
}
