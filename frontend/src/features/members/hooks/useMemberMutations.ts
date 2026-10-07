import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { addMember, removeMember, updateMemberRole } from '../api/membersApi'
import type { AddMemberInput, UpdateMemberRoleInput } from '../types'

export function useMemberMutations(workspaceId: string) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.members.byWorkspace(workspaceId),
    })
  }

  const addMutation = useMutation({
    mutationFn: (input: AddMemberInput) => addMember(workspaceId, input),
    onSuccess: invalidate,
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, input }: { memberId: string; input: UpdateMemberRoleInput }) =>
      updateMemberRole(workspaceId, memberId, input),
    onSuccess: invalidate,
  })

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeMember(workspaceId, memberId),
    onSuccess: invalidate,
  })

  return {
    addMember: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    addError: addMutation.error,
    resetAddError: addMutation.reset,
    updateRole: updateRoleMutation.mutateAsync,
    removeMember: removeMutation.mutateAsync,
  }
}
