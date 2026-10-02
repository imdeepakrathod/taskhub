import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors/httpErrors.js'
import { prisma } from '../../config/database.js'

import type { AddMemberInput, UpdateMemberRoleInput } from './members.schema.js'
import {
  addMember as addMemberInDb,
  findMemberById,
  findMembersByWorkspace,
  removeMember as removeMemberInDb,
  updateMemberRole as updateMemberRoleInDb,
} from './members.repository.js'

export async function listMembers(workspaceId: string) {
  return findMembersByWorkspace(workspaceId)
}

export async function addMember(workspaceId: string, input: AddMemberInput) {
  // Step 1: Find the user by email
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  })

  if (!user) {
    throw new NotFoundError('No user found with that email', 'USER_NOT_FOUND')
  }

  // Step 2: Check if already a member (prevent duplicates)
  const existing = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId: user.id },
    },
  })

  if (existing) {
    throw new ConflictError('User is already a member of this workspace', 'MEMBER_ALREADY_EXISTS')
  }

  // Step 3: Add them with the requested role (default: MEMBER)
  return addMemberInDb(workspaceId, user.id, input.role ?? 'MEMBER')
}

export async function updateMemberRole(
  memberId: string,
  workspaceId: string,
  input: UpdateMemberRoleInput,
) {
  const member = await findMemberById(memberId, workspaceId)

  if (!member) {
    throw new NotFoundError('Member not found', 'MEMBER_NOT_FOUND')
  }

  // Business rule: OWNER role is immutable
  if (member.role === 'OWNER') {
    throw new BadRequestError("Cannot change the owner's role", 'CANNOT_MODIFY_OWNER')
  }

  return updateMemberRoleInDb(memberId, input.role)
}

export async function removeMember(memberId: string, workspaceId: string) {
  const member = await findMemberById(memberId, workspaceId)

  if (!member) {
    throw new NotFoundError('Member not found', 'MEMBER_NOT_FOUND')
  }

  // Business rule: workspace must always have an OWNER
  if (member.role === 'OWNER') {
    throw new BadRequestError('Cannot remove the workspace owner', 'CANNOT_REMOVE_OWNER')
  }

  await removeMemberInDb(memberId)
}
