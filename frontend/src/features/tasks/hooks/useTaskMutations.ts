import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { createTask, deleteTask, updateTask } from '../api/tasksApi'
import type { CreateTaskInput, Task, UpdateTaskInput } from '../types'

export function useTaskMutations(projectId: string) {
  const queryClient = useQueryClient()
  const projectTasksQueryKey = queryKeys.tasks.byProject(projectId)

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: projectTasksQueryKey,
    })
  }

  const createMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(projectId, input),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) =>
      updateTask(projectId, taskId, input),

    // Optimistic Update: instantly update cache before API response
    onMutate: async ({ taskId, input }) => {
      await queryClient.cancelQueries({ queryKey: projectTasksQueryKey })

      const previousTasks = queryClient.getQueryData<Task[]>(projectTasksQueryKey)

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          projectTasksQueryKey,
          previousTasks.map((task) => (task.id === taskId ? { ...task, ...input } : task)),
        )
      }

      return { previousTasks }
    },

    // Rollback to previous state if API call fails
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(projectTasksQueryKey, context.previousTasks)
      }
    },

    // Sync with server data once settled
    onSettled: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(projectId, taskId),
    onSuccess: invalidate,
  })

  return {
    createTask: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateTask: updateMutation.mutateAsync,
    deleteTask: deleteMutation.mutateAsync,
  }
}
