import { api } from '../../../lib/axios'
import type { ApiSuccess } from '../../auth/types'
import type { SearchResults } from '../types'

export async function searchWorkspaceApi(
  workspaceId: string,
  query: string,
): Promise<SearchResults> {
  const response = await api.get<ApiSuccess<SearchResults>>(`/workspaces/${workspaceId}/search`, {
    params: { q: query },
  })

  return response.data.data
}
