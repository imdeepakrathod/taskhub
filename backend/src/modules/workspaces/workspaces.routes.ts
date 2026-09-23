import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { authenticate } from '../../middlewares/authenticate.js'
import { validateBody } from '../../middlewares/validate.js'

import { createWorkspaceBodySchema } from './workspaces.schema.js'

import { createWorkspaceController, listWorkspacesController } from './workspaces.controller.js'

const workspacesRouter = Router()

workspacesRouter.post(
  '/',
  authenticate,
  validateBody(createWorkspaceBodySchema),
  asyncHandler(createWorkspaceController),
)

workspacesRouter.get('/', authenticate, asyncHandler(listWorkspacesController))

export default workspacesRouter
