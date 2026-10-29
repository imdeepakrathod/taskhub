import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { deleteAttachment, uploadAttachment } from '../api/attachmentsApi'

export function useAttachmentMutations(taskId: string) {
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAttachment(taskId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.attachments.byTask(taskId),
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) => deleteAttachment(taskId, attachmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.attachments.byTask(taskId),
      })
    },
  })

  return {
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
