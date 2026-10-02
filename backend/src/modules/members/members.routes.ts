import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizeWorkspaceMember } from '../../middlewares/authorize.js'
import { validateBody } from '../../middlewares/validate.js'

import {
  addMemberController,
  listMembersController,
  removeMemberController,
  updateMemberRoleController,
} from './members.controller.js'
import { addMemberBodySchema, updateMemberRoleBodySchema } from './members.schema.js'

const membersRouter = Router({ mergeParams: true })

// Any workspace member can see the team
membersRouter.get(
  '/',
  authenticate,
  authorizeWorkspaceMember(),
  asyncHandler(listMembersController),
)

// Only OWNER and ADMIN can add new members
membersRouter.post(
  '/',
  authenticate,
  authorizeWorkspaceMember(['OWNER', 'ADMIN']),
  validateBody(addMemberBodySchema),
  asyncHandler(addMemberController),
)

// Only OWNER can change someone's role
membersRouter.patch(
  '/:memberId',
  authenticate,
  authorizeWorkspaceMember(['OWNER']),
  validateBody(updateMemberRoleBodySchema),
  asyncHandler(updateMemberRoleController),
)

// OWNER and ADMIN can remove members (service prevents removing the OWNER)
membersRouter.delete(
  '/:memberId',
  authenticate,
  authorizeWorkspaceMember(['OWNER', 'ADMIN']),
  asyncHandler(removeMemberController),
)

export default membersRouter
