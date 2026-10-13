import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizeTaskAccess, authorizeWorkspaceMember } from '../../middlewares/authorize.js'
import { validateBody } from '../../middlewares/validate.js'

import {
  attachLabelController,
  createLabelController,
  deleteLabelController,
  detachLabelController,
  listLabelsController,
} from './labels.controller.js'
import { attachLabelBodySchema, createLabelBodySchema } from './labels.schema.js'

// Workspace Labels Router: /api/v1/workspaces/:workspaceId/labels
export const workspaceLabelsRouter = Router({ mergeParams: true })

workspaceLabelsRouter.use(authenticate, authorizeWorkspaceMember())

workspaceLabelsRouter.get('/', asyncHandler(listLabelsController))
workspaceLabelsRouter.post(
  '/',
  validateBody(createLabelBodySchema),
  asyncHandler(createLabelController),
)
workspaceLabelsRouter.delete('/:labelId', asyncHandler(deleteLabelController))

// Task Labels Router: /api/v1/tasks/:taskId/labels
export const taskLabelsRouter = Router({ mergeParams: true })

taskLabelsRouter.use(authenticate, authorizeTaskAccess())

taskLabelsRouter.post('/', validateBody(attachLabelBodySchema), asyncHandler(attachLabelController))
taskLabelsRouter.delete('/:labelId', asyncHandler(detachLabelController))
