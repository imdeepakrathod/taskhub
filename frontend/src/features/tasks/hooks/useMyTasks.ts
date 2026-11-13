import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { fetchMyTasks } from '../api/myTasksApi'

export function useMyTasks(workspaceId?: string) {
  return useQuery({
    queryKey: queryKeys.myTasks.byWorkspace(workspaceId ?? ''),
    queryFn: () => fetchMyTasks(workspaceId!),
    enabled: Boolean(workspaceId),
  })
}
