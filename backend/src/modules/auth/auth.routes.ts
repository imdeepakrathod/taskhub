import { Router } from 'express'

import { asyncHandler } from '../../common/utils/asyncHandler.js'
import { validateBody } from '../../middlewares/validate.js'
import { authenticate } from '../../middlewares/authenticate.js'

import {
  loginController,
  logoutController,
  refreshController,
  registerController,
} from './auth.controller.js'
import { loginBodySchema, registerBodySchema } from './auth.schema.js'

const authRouter = Router()

authRouter.post('/register', validateBody(registerBodySchema), asyncHandler(registerController))

authRouter.post('/login', validateBody(loginBodySchema), asyncHandler(loginController))

authRouter.post('/refresh', asyncHandler(refreshController))

authRouter.post('/logout', asyncHandler(logoutController))

authRouter.get('/me', authenticate, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  })
})

export default authRouter
