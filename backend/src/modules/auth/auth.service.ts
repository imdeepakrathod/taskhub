import { Prisma } from '../../generated/prisma/client.js'
import { ConflictError } from '../../common/errors/httpErrors.js'
import { hashPassword } from '../../common/utils/password.js'

import { createUser, findUserByEmail } from './auth.repository.js'
import type { RegisterInput } from './auth.schema.js'

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
