import { UnauthorizedError } from '../../common/errors/httpErrors.js'
import { signAccessToken } from '../../common/utils/jwt.js'
import { generateRefreshToken, hashRefreshToken } from '../../common/utils/refreshToken.js'

import {
  findRefreshTokenByHash,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
} from './auth.repository.js'

function createInvalidRefreshTokenError(): UnauthorizedError {
  return new UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN')
}

export async function refreshSession(rawToken: string | undefined) {
  if (!rawToken) {
    throw createInvalidRefreshTokenError()
  }

  const tokenHash = hashRefreshToken(rawToken)
  const storedToken = await findRefreshTokenByHash(tokenHash)

  if (!storedToken) {
    throw createInvalidRefreshTokenError()
  }

  if (storedToken.revokedAt) {
    // Token reuse detected. Revoke all sessions for this user.
    await revokeAllUserRefreshTokens(storedToken.userId)
    throw createInvalidRefreshTokenError()
  }

  if (storedToken.expiresAt <= new Date()) {
    await revokeRefreshToken(storedToken.id)
    throw createInvalidRefreshTokenError()
  }

  const newRefreshToken = generateRefreshToken()

  const rotated = await rotateRefreshToken({
    oldTokenId: storedToken.id,
    userId: storedToken.userId,
    tokenHash: newRefreshToken.tokenHash,
    expiresAt: newRefreshToken.expiresAt,
  })

  if (!rotated) {
    // Another request rotated the same token concurrently.
    await revokeAllUserRefreshTokens(storedToken.userId)
    throw createInvalidRefreshTokenError()
  }

  return {
    user: storedToken.user,
    accessToken: signAccessToken({
      sub: storedToken.user.id,
      email: storedToken.user.email,
    }),
    refreshToken: newRefreshToken.rawToken,
  }
}

export async function logoutSession(rawToken: string | undefined): Promise<void> {
  if (!rawToken) {
    return
  }

  const tokenHash = hashRefreshToken(rawToken)
  const storedToken = await findRefreshTokenByHash(tokenHash)

  if (storedToken) {
    await revokeRefreshToken(storedToken.id)
  }
}
