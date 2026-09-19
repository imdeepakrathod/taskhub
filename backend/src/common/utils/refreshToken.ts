import { createHash, randomBytes } from 'node:crypto'

import { env } from '../../config/env.js'

const durationPattern = /^(\d+)([smhd])$/

const durationMultipliers = {
  s: 1_000,
  m: 60_000,
  h: 60 * 60_000,
  d: 24 * 60 * 60_000,
} as const

function durationToMilliseconds(value: string): number {
  const match = durationPattern.exec(value)

  if (!match) {
    throw new Error(`Invalid duration format: ${value}`)
  }

  const amount = Number(match[1])
  const unit = match[2] as keyof typeof durationMultipliers

  return amount * durationMultipliers[unit]
}

export function generateRefreshToken() {
  const rawToken = randomBytes(48).toString('base64url')
  const tokenHash = hashRefreshToken(rawToken)

  const expiresAt = new Date(Date.now() + durationToMilliseconds(env.JWT_REFRESH_EXPIRES_IN))

  return {
    rawToken,
    tokenHash,
    expiresAt,
  }
}

export function hashRefreshToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}

export function refreshTokenMaxAge(): number {
  return durationToMilliseconds(env.JWT_REFRESH_EXPIRES_IN)
}
