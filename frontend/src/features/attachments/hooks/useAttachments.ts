import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { fetchAttachments } from '../api/attachmentsApi'

export function useAttachments(taskId: string) {
  return useQuery({
    queryKey: queryKeys.attachments.byTask(taskId),
    queryFn: () => fetchAttachments(taskId),
    enabled: Boolean(taskId),
  })
}
