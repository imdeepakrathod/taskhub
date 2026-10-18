import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { fetchProjectActivities } from '../api/activityApi'

export function useProjectActivity(projectId: string) {
  return useQuery({
    queryKey: queryKeys.activity.byProject(projectId),
    queryFn: () => fetchProjectActivities(projectId),
    enabled: Boolean(projectId),
  })
}
