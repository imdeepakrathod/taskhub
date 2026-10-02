import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { fetchTasks } from '../api/tasksApi'

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: queryKeys.tasks.byProject(projectId ?? ''),
    queryFn: () => fetchTasks(projectId!),
    enabled: Boolean(projectId),
  })
}
