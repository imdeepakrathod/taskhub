import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { authenticate } from '../../middlewares/authenticate.js'
import { validateBody } from '../../middlewares/validate.js'

import { createWorkspaceController } from './workspaces.controller.js'
import { createWorkspaceBodySchema } from './workspaces.schema.js'

const workspacesRouter = Router()

workspacesRouter.post(
  '/',
  authenticate,
  validateBody(createWorkspaceBodySchema),
  asyncHandler(createWorkspaceController),
)

export default workspacesRouter
