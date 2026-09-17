import jwt from 'jsonwebtoken'

import { env } from '../../config/env.js'

export type AccessTokenPayload = {
  sub: string
  email: string
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    issuer: 'taskhub',
    audience: 'taskhub-api',
  } as jwt.SignOptions)
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'taskhub',
    audience: 'taskhub-api',
  })

  if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
    throw new Error('Malformed access token payload')
  }

  return {
    sub: decoded.sub,
    email: String(decoded.email),
  }
}
