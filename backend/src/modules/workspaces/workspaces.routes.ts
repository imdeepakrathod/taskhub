import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizeWorkspaceMember } from '../../middlewares/authorize.js'
import { validateBody } from '../../middlewares/validate.js'

import {
  createWorkspaceController,
  deleteWorkspaceController,
  listWorkspacesController,
  updateWorkspaceController,
} from './workspaces.controller.js'
import { createWorkspaceBodySchema, updateWorkspaceBodySchema } from './workspaces.schema.js'

const workspacesRouter = Router()

workspacesRouter.post(
  '/',
  authenticate,
  validateBody(createWorkspaceBodySchema),
  asyncHandler(createWorkspaceController),
)

workspacesRouter.get('/', authenticate, asyncHandler(listWorkspacesController))

// OWNER & ADMIN can rename workspace
workspacesRouter.patch(
  '/:workspaceId',
  authenticate,
  authorizeWorkspaceMember(['OWNER', 'ADMIN']),
  validateBody(updateWorkspaceBodySchema),
  asyncHandler(updateWorkspaceController),
)

// STRICT: ONLY OWNER can delete a workspace
workspacesRouter.delete(
  '/:workspaceId',
  authenticate,
  authorizeWorkspaceMember(['OWNER']),
  asyncHandler(deleteWorkspaceController),
)

export default workspacesRouter
