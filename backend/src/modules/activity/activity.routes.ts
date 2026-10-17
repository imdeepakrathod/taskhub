import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizeProjectMember, authorizeWorkspaceMember } from '../../middlewares/authorize.js'

import {
  getProjectActivityController,
  getWorkspaceActivityController,
} from './activity.controller.js'

// Workspace activities: /api/v1/workspaces/:workspaceId/activity
export const workspaceActivityRouter = Router({ mergeParams: true })
workspaceActivityRouter.use(authenticate, authorizeWorkspaceMember())
workspaceActivityRouter.get('/', asyncHandler(getWorkspaceActivityController))

// Project activities: /api/v1/projects/:projectId/activity
export const projectActivityRouter = Router({ mergeParams: true })
projectActivityRouter.use(authenticate, authorizeProjectMember())
projectActivityRouter.get('/', asyncHandler(getProjectActivityController))
