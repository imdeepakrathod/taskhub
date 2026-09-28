import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { createProject } from '../api/projectsApi'
import type { CreateProjectInput } from '../types'

export function useCreateProject(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.byWorkspace(workspaceId),
      })
    },
  })
}
