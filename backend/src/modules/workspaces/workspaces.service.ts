import { randomBytes } from 'node:crypto'

import { Prisma } from '../../generated/prisma/client.js'

import { createSlug } from '../../common/utils/slug.js'

import { createWorkspaceWithOwner } from './workspaces.repository.js'
import type { CreateWorkspaceInput } from './workspaces.schema.js'

const MAX_SLUG_ATTEMPTS = 5

function createSlugCandidate(baseSlug: string, attempt: number): string {
  if (attempt === 0) {
    return baseSlug
  }

  const suffix = randomBytes(3).toString('hex')
  const truncatedBase = baseSlug.slice(0, 100 - suffix.length - 1)

  return `${truncatedBase}-${suffix}`
}

export async function createWorkspace(ownerId: string, input: CreateWorkspaceInput) {
  const baseSlug = createSlug(input.name)

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug = createSlugCandidate(baseSlug, attempt)

    try {
      return await createWorkspaceWithOwner({
        name: input.name,
        slug,
        ownerId,
      })
    } catch (error: unknown) {
      const isUniqueConstraintError =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'

      if (!isUniqueConstraintError) {
        throw error
      }
    }
  }

  throw new Error('Unable to generate a unique workspace slug')
}
