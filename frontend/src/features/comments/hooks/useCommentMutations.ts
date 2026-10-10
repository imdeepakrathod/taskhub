import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { createComment, deleteComment } from '../api/commentsApi'

export function useCommentMutations(taskId: string) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.comments.byTask(taskId),
    })
  }

  const createMutation = useMutation({
    mutationFn: (content: string) => createComment(taskId, content),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(taskId, commentId),
    onSuccess: invalidate,
  })

  return {
    addComment: createMutation.mutateAsync,
    isAdding: createMutation.isPending,
    removeComment: deleteMutation.mutateAsync,
  }
}
