import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { validateBody } from '../../middlewares/validate.js'

import { loginController, registerController } from './auth.controller.js'
import { loginBodySchema, registerBodySchema } from './auth.schema.js'
import { authenticate } from '../../middlewares/authenticate.js'

const authRouter = Router()

authRouter.post('/register', validateBody(registerBodySchema), asyncHandler(registerController))
authRouter.post('/login', validateBody(loginBodySchema), asyncHandler(loginController))
authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    res.status(200).json({ status: 'success', data: { user: req.user } })
  }),
)
export default authRouter
