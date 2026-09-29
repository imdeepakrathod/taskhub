import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizeProjectMember } from '../../middlewares/authorize.js'
import { validateBody } from '../../middlewares/validate.js'

import {
  createTaskController,
  deleteTaskController,
  getTaskController,
  listTasksController,
  updateTaskController,
} from './tasks.controller.js'
import { createTaskBodySchema, updateTaskBodySchema } from './tasks.schema.js'

const tasksRouter = Router({ mergeParams: true })

tasksRouter.use(authenticate, authorizeProjectMember())

tasksRouter.post('/', validateBody(createTaskBodySchema), asyncHandler(createTaskController))
tasksRouter.get('/', asyncHandler(listTasksController))
tasksRouter.get('/:taskId', asyncHandler(getTaskController))
tasksRouter.patch(
  '/:taskId',
  validateBody(updateTaskBodySchema),
  asyncHandler(updateTaskController),
)
tasksRouter.delete('/:taskId', asyncHandler(deleteTaskController))

export default tasksRouter
