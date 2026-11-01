import type { CookieOptions, Response } from 'express'

import { refreshTokenMaxAge } from './refreshToken.js'

export const REFRESH_TOKEN_COOKIE = 'taskhub_refresh_token'

function refreshCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/api/v1/auth',
    maxAge: refreshTokenMaxAge(),
  }
}

export function setRefreshTokenCookie(res: Response, rawToken: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, rawToken, refreshCookieOptions())
}

export function clearRefreshTokenCookie(res: Response): void {
  const isProduction = process.env.NODE_ENV === 'production'

  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/api/v1/auth',
  })
}
