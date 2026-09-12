import type { Request, Response } from 'express'

import type { RegisterInput } from './auth.schema.js'
import { registerUser } from './auth.service.js'

type RegisterRequest = Request<Record<string, never>, unknown, RegisterInput>

export async function registerController(req: RegisterRequest, res: Response): Promise<void> {
  const user = await registerUser(req.body)

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  })
}
