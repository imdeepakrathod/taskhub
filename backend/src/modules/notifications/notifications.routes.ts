import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizeWorkspaceMember } from '../../middlewares/authorize.js'

import {
  listNotificationsController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController,
} from './notifications.controller.js'

const notificationsRouter = Router({ mergeParams: true })

// Require authentication & workspace membership
notificationsRouter.use(authenticate, authorizeWorkspaceMember())

notificationsRouter.get('/', asyncHandler(listNotificationsController))
notificationsRouter.patch('/read-all', asyncHandler(markAllNotificationsAsReadController))
notificationsRouter.patch('/:notificationId/read', asyncHandler(markNotificationAsReadController))

export default notificationsRouter
