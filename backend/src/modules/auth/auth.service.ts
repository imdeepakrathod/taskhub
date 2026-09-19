import { Prisma } from '../../generated/prisma/client.js'

import { ConflictError, UnauthorizedError } from '../../common/errors/httpErrors.js'
import { signAccessToken } from '../../common/utils/jwt.js'
import { hashPassword, verifyPassword } from '../../common/utils/password.js'
import { generateRefreshToken } from '../../common/utils/refreshToken.js'

import {
  createRefreshToken,
  createUser,
  findUserByEmail,
  findUserCredentialsByEmail,
} from './auth.repository.js'
import type { LoginInput, RegisterInput } from './auth.schema.js'

function createEmailConflictError(): ConflictError {
  return new ConflictError('An account with this email already exists', 'EMAIL_ALREADY_EXISTS')
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await findUserByEmail(input.email)

  if (existingUser) {
    throw createEmailConflictError()
  }

  const passwordHash = await hashPassword(input.password)

  try {
    return await createUser({
      name: input.name,
      email: input.email,
      passwordHash,
    })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw createEmailConflictError()
    }

    throw error
  }
}

const dummyHashPromise = hashPassword('invalid-password-placeholder')

function createInvalidCredentialsError(): UnauthorizedError {
  return new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS')
}

export async function loginUser(input: LoginInput) {
  const user = await findUserCredentialsByEmail(input.email)

  if (!user) {
    await verifyPassword(await dummyHashPromise, input.password)
    throw createInvalidCredentialsError()
  }

  const isPasswordValid = await verifyPassword(user.passwordHash, input.password)

  if (!isPasswordValid) {
    throw createInvalidCredentialsError()
  }

  const refreshToken = generateRefreshToken()

  await createRefreshToken({
    tokenHash: refreshToken.tokenHash,
    userId: user.id,
    expiresAt: refreshToken.expiresAt,
  })

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }
  return {
    user: safeUser,
    accessToken: signAccessToken({
      sub: user.id,
      email: user.email,
    }),
    refreshToken: refreshToken.rawToken,
  }
}
