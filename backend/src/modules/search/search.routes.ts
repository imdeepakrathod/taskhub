import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizeWorkspaceMember } from '../../middlewares/authorize.js'
import { validateQuery } from '../../middlewares/validate.js'

import { searchWorkspaceController } from './search.controller.js'
import { searchQuerySchema } from './search.schema.js'

const searchRouter = Router({ mergeParams: true })

searchRouter.use(authenticate, authorizeWorkspaceMember())

searchRouter.get('/', validateQuery(searchQuerySchema), asyncHandler(searchWorkspaceController))

export default searchRouter
