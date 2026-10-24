import { searchWorkspaceEntities } from './search.repository.js'

export async function searchWorkspace(workspaceId: string, query: string) {
  return searchWorkspaceEntities(workspaceId, query)
}
