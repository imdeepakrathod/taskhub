import type { Request, Response } from 'express'

import type { RegisterInput } from './auth.schema.js'

import type { LoginInput } from './auth.schema.js'
import { loginUser, registerUser } from './auth.service.js'

type RegisterRequest = Request<Record<string, never>, unknown, RegisterInput>
type LoginRequest = Request<Record<string, never>, unknown, LoginInput>

export async function registerController(req: RegisterRequest, res: Response): Promise<void> {
  const user = await registerUser(req.body)

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  })
}

export async function loginController(req: LoginRequest, res: Response): Promise<void> {
  const result = await loginUser(req.body)

  res.status(200).json({
    status: 'success',
    data: result,
  })
}
