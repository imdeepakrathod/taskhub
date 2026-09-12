import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { validateBody } from '../../middlewares/validate.js'

import { registerController } from './auth.controller.js'
import { registerBodySchema } from './auth.schema.js'

const authRouter = Router()

authRouter.post('/register', validateBody(registerBodySchema), asyncHandler(registerController))

export default authRouter
