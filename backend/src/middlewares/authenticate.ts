import type { RequestHandler } from 'express'

import { UnauthorizedError } from '../common/errors/httpErrors.js'
import { verifyAccessToken } from '../common/utils/jwt.js'

export const authenticate: RequestHandler = (req, _res, next) => {
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Authentication required', 'UNAUTHENTICATED'))

    return
  }

  const token = authorization.slice('Bearer '.length).trim()

  if (!token) {
    next(new UnauthorizedError('Authentication required', 'UNAUTHENTICATED'))

    return
  }

  try {
    const payload = verifyAccessToken(token)

    req.user = {
      id: payload.sub,
      email: payload.email,
    }

    next()
  } catch {
    next(new UnauthorizedError('Invalid or expired token', 'INVALID_TOKEN'))
  }
}
