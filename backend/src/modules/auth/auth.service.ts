import { Prisma } from '../../generated/prisma/client.js'
import { ConflictError } from '../../common/errors/httpErrors.js'
import { hashPassword, verifyPassword } from '../../common/utils/password.js'

import { createUser, findUserByEmail } from './auth.repository.js'
import type { RegisterInput } from './auth.schema.js'

import { UnauthorizedError } from '../../common/errors/httpErrors.js'
import { signAccessToken } from '../../common/utils/jwt.js'

import { findUserCredentialsByEmail } from './auth.repository.js'
import type { LoginInput } from './auth.schema.js'

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

// Pre-computed once: keeps response time similar when the email does not exist,
// so attackers cannot enumerate accounts by measuring latency.
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

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    accessToken: signAccessToken({ sub: user.id, email: user.email }),
  }
}
