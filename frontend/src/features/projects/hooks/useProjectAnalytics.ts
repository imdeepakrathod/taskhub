import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { fetchProjectAnalytics } from '../api/projectsApi'

export function useProjectAnalytics(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.analytics(workspaceId, projectId),
    queryFn: () => fetchProjectAnalytics(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  })
}
