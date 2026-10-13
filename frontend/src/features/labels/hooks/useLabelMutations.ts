import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import {
  attachLabelToTask,
  createWorkspaceLabel,
  deleteWorkspaceLabel,
  detachLabelFromTask,
} from '../api/labelsApi'
import type { CreateLabelInput } from '../types'

export function useLabelMutations(workspaceId: string, projectId?: string) {
  const queryClient = useQueryClient()

  const invalidateLabels = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.labels.byWorkspace(workspaceId),
    })
  }

  const invalidateTasks = () => {
    if (projectId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byProject(projectId),
      })
    }
  }

  const createMutation = useMutation({
    mutationFn: (input: CreateLabelInput) => createWorkspaceLabel(workspaceId, input),
    onSuccess: invalidateLabels,
  })

  const deleteMutation = useMutation({
    mutationFn: (labelId: string) => deleteWorkspaceLabel(workspaceId, labelId),
    onSuccess: () => {
      invalidateLabels()
      invalidateTasks()
    },
  })

  const attachMutation = useMutation({
    mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
      attachLabelToTask(taskId, labelId),
    onSuccess: invalidateTasks,
  })

  const detachMutation = useMutation({
    mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
      detachLabelFromTask(taskId, labelId),
    onSuccess: invalidateTasks,
  })

  return {
    createLabel: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteLabel: deleteMutation.mutateAsync,
    attachLabel: attachMutation.mutateAsync,
    detachLabel: detachMutation.mutateAsync,
  }
}
