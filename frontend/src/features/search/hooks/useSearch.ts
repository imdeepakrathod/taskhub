import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { searchWorkspaceApi } from '../api/searchApi'

export function useSearch(workspaceId: string, searchTerm: string) {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm)

  // 300ms Debounce: avoids spamming the backend while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim())
    }, 300)

    return () => clearTimeout(handler)
  }, [searchTerm])

  return useQuery({
    queryKey: queryKeys.search.query(workspaceId, debouncedTerm),
    queryFn: () => searchWorkspaceApi(workspaceId, debouncedTerm),
    enabled: Boolean(workspaceId && debouncedTerm.length >= 1),
    staleTime: 1000 * 60, // 1 minute cache
  })
}
