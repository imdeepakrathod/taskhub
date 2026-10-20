import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { deleteProject, updateProject } from '../api/projectsApi'
import type { CreateProjectInput } from '../types'

export function useProjectMutations(workspaceId: string) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.projects.byWorkspace(workspaceId),
    })
  }

  const updateMutation = useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: Partial<CreateProjectInput> }) =>
      updateProject(workspaceId, projectId, input),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => deleteProject(workspaceId, projectId),
    onSuccess: invalidate,
  })

  return {
    updateProject: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProject: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
