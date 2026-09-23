import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { createWorkspace } from '../api/workspacesApi'
import type { CreateWorkspaceInput } from '../types'

export function useCreateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => createWorkspace(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all })
    },
  })
}
