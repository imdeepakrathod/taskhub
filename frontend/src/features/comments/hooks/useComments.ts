import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { fetchComments } from '../api/commentsApi'

export function useComments(taskId?: string) {
  return useQuery({
    queryKey: queryKeys.comments.byTask(taskId ?? ''),
    queryFn: () => fetchComments(taskId!),
    enabled: Boolean(taskId),
  })
}
