import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizeWorkspaceMember } from '../../middlewares/authorize.js'
import { validateBody } from '../../middlewares/validate.js'

import {
  createProjectController,
  deleteProjectController,
  getProjectController,
  listProjectsController,
  updateProjectController,
} from './projects.controller.js'
import { createProjectBodySchema, updateProjectBodySchema } from './projects.schema.js'

const projectsRouter = Router({ mergeParams: true })

projectsRouter.post(
  '/',
  authenticate,
  authorizeWorkspaceMember(),
  validateBody(createProjectBodySchema),
  asyncHandler(createProjectController),
)

projectsRouter.get(
  '/',
  authenticate,
  authorizeWorkspaceMember(),
  asyncHandler(listProjectsController),
)

projectsRouter.get(
  '/:projectId',
  authenticate,
  authorizeWorkspaceMember(),
  asyncHandler(getProjectController),
)

projectsRouter.patch(
  '/:projectId',
  authenticate,
  authorizeWorkspaceMember(),
  validateBody(updateProjectBodySchema),
  asyncHandler(updateProjectController),
)

projectsRouter.delete(
  '/:projectId',
  authenticate,
  authorizeWorkspaceMember(['OWNER', 'ADMIN']),
  asyncHandler(deleteProjectController),
)

export default projectsRouter
