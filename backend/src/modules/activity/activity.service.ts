import { findActivitiesByProject, findActivitiesByWorkspace } from './activity.repository.js'

export async function listProjectActivity(projectId: string) {
  return findActivitiesByProject(projectId)
}

export async function listWorkspaceActivity(workspaceId: string) {
  return findActivitiesByWorkspace(workspaceId)
}
