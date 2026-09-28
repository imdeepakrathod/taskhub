import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { fetchProjects } from '../api/projectsApi'

export function useProjects(workspaceId?: string) {
  return useQuery({
    queryKey: queryKeys.projects.byWorkspace(workspaceId ?? ''),
    queryFn: () => fetchProjects(workspaceId!),
    enabled: Boolean(workspaceId),
  })
}
