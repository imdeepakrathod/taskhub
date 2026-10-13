import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { fetchWorkspaceLabels } from '../api/labelsApi'

export function useLabels(workspaceId?: string) {
  return useQuery({
    queryKey: queryKeys.labels.byWorkspace(workspaceId ?? ''),
    queryFn: () => fetchWorkspaceLabels(workspaceId!),
    enabled: Boolean(workspaceId),
  })
}
