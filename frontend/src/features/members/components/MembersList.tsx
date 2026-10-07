import { useState } from 'react'
import type { AxiosError } from 'axios'

import { useMembers } from '../hooks/useMembers'
import { useMemberMutations } from '../hooks/useMemberMutations'
import type { Member } from '../types'

type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER'

const roleBadgeStyles: Record<WorkspaceRole, string> = {
  OWNER: 'bg-purple-100 text-purple-800 border-purple-200',
  ADMIN: 'bg-blue-50 text-blue-700 border-blue-200',
  MEMBER: 'bg-gray-100 text-gray-700 border-gray-200',
}

type MembersListProps = {
  workspaceId: string
  currentUserRole: WorkspaceRole
  currentUserId: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ error?: { message?: string } }>

  return axiosError?.response?.data?.error?.message ?? 'Something went wrong'
}

export function MembersList({ workspaceId, currentUserRole, currentUserId }: MembersListProps) {
  const { data: members = [], isLoading } = useMembers(workspaceId)
  const { addMember, isAdding, addError, resetAddError, updateRole, removeMember } =
    useMemberMutations(workspaceId)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER')

  const canInvite = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN'
  const canChangeRole = currentUserRole === 'OWNER'
  const canRemove = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN'

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    resetAddError()

    try {
      await addMember({ email: inviteEmail.trim().toLowerCase(), role: inviteRole })
      setInviteEmail('')
      setInviteRole('MEMBER')
    } catch {
      // Error is captured in addError
    }
  }

  const handleRoleChange = (member: Member, newRole: 'ADMIN' | 'MEMBER') => {
    void updateRole({ memberId: member.id, input: { role: newRole } })
  }

  const handleRemove = (member: Member) => {
    void removeMember(member.id)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-500">Manage who has access to this workspace</p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      {/* Invite Form — only for OWNER and ADMIN */}
      {canInvite && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Invite a team member</h3>

          {addError && (
            <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
              {getApiErrorMessage(addError)}
            </div>
          )}

          <form onSubmit={handleInvite} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email address</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="w-32">
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'MEMBER')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isAdding}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition shrink-0"
            >
              {isAdding ? 'Inviting...' : 'Invite'}
            </button>
          </form>
        </div>
      )}

      {/* Members List */}
      {isLoading && <p className="text-sm text-gray-500">Loading team...</p>}

      <div className="rounded-xl border border-gray-200 bg-white shadow-2xs overflow-hidden">
        <div className="divide-y divide-gray-100">
          {members.map((member) => {
            const isCurrentUser = member.user.id === currentUserId
            const isOwner = member.role === 'OWNER'

            return (
              <div
                key={member.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition"
              >
                {/* Left: Avatar + Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {getInitials(member.user.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-gray-900">
                        {member.user.name}
                      </span>
                      {isCurrentUser && (
                        <span className="rounded bg-green-50 border border-green-200 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                          You
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-gray-500">{member.user.email}</p>
                  </div>
                </div>

                {/* Right: Role + Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Role badge or selector */}
                  {canChangeRole && !isOwner ? (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member, e.target.value as 'ADMIN' | 'MEMBER')
                      }
                      className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                    </select>
                  ) : (
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                        roleBadgeStyles[member.role]
                      }`}
                    >
                      {member.role}
                    </span>
                  )}

                  {/* Remove button */}
                  {canRemove && !isOwner && !isCurrentUser && (
                    <button
                      onClick={() => handleRemove(member)}
                      title="Remove member"
                      className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
