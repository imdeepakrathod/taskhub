import { api } from '../../../lib/axios'
import type { ApiSuccess } from '../../auth/types'
import type { AddMemberInput, Member, UpdateMemberRoleInput } from '../types'

export async function fetchMembers(workspaceId: string): Promise<Member[]> {
  const response = await api.get<ApiSuccess<{ members: Member[] }>>(
    `/workspaces/${workspaceId}/members`,
  )

  return response.data.data.members
}

export async function addMember(workspaceId: string, input: AddMemberInput): Promise<Member> {
  const response = await api.post<ApiSuccess<{ member: Member }>>(
    `/workspaces/${workspaceId}/members`,
    input,
  )

  return response.data.data.member
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  input: UpdateMemberRoleInput,
): Promise<Member> {
  const response = await api.patch<ApiSuccess<{ member: Member }>>(
    `/workspaces/${workspaceId}/members/${memberId}`,
    input,
  )

  return response.data.data.member
}

export async function removeMember(workspaceId: string, memberId: string): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/members/${memberId}`)
}
