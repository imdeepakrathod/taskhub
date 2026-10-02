import type { Request, Response } from 'express'

import { ForbiddenError } from '../../common/errors/httpErrors.js'

import type { AddMemberInput, UpdateMemberRoleInput } from './members.schema.js'
import { addMember, listMembers, removeMember, updateMemberRole } from './members.service.js'

type AddMemberRequest = Request<Record<string, string>, unknown, AddMemberInput>
type UpdateMemberRequest = Request<Record<string, string>, unknown, UpdateMemberRoleInput>

export async function listMembersController(req: Request, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const members = await listMembers(req.membership.workspaceId)

  res.status(200).json({
    status: 'success',
    data: { members },
  })
}

export async function addMemberController(req: AddMemberRequest, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const member = await addMember(req.membership.workspaceId, req.body)

  res.status(201).json({
    status: 'success',
    data: { member },
  })
}

export async function updateMemberRoleController(
  req: UpdateMemberRequest,
  res: Response,
): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const memberId = req.params.memberId as string
  const member = await updateMemberRole(memberId, req.membership.workspaceId, req.body)

  res.status(200).json({
    status: 'success',
    data: { member },
  })
}

export async function removeMemberController(req: Request, res: Response): Promise<void> {
  if (!req.membership) {
    throw new ForbiddenError('Authentication required', 'UNAUTHENTICATED')
  }

  const memberId = req.params.memberId as string
  await removeMember(memberId, req.membership.workspaceId)

  res.status(204).send()
}
