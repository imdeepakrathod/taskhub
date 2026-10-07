import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { fetchMembers } from '../api/membersApi'

export function useMembers(workspaceId?: string) {
  return useQuery({
    queryKey: queryKeys.members.byWorkspace(workspaceId ?? ''),
    queryFn: () => fetchMembers(workspaceId!),
    enabled: Boolean(workspaceId),
  })
}
