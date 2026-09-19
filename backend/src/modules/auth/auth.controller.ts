import type { Request, Response } from 'express'

import { loginUser, registerUser } from './auth.service.js'
import { logoutSession, refreshSession } from './auth.session.service.js'
import type { LoginInput, RegisterInput } from './auth.schema.js'

import {
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE,
  setRefreshTokenCookie,
} from '../../common/utils/authCookies.js'

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

  setRefreshTokenCookie(res, result.refreshToken)

  res.status(200).json({
    status: 'success',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  })
}

export async function refreshController(req: Request, res: Response): Promise<void> {
  const rawToken = req.cookies?.[REFRESH_TOKEN_COOKIE]
  const result = await refreshSession(rawToken)

  setRefreshTokenCookie(res, result.refreshToken)

  res.status(200).json({
    status: 'success',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  })
}

export async function logoutController(req: Request, res: Response): Promise<void> {
  const rawToken = req.cookies?.[REFRESH_TOKEN_COOKIE]

  await logoutSession(rawToken)
  clearRefreshTokenCookie(res)

  res.status(204).send()
}
