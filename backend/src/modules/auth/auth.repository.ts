import { prisma } from '../../config/database.js'

type CreateUserData = {
  name: string
  email: string
  passwordHash: string
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
    },
  })
}

export async function createUser(data: CreateUserData) {
  return prisma.user.create({
    data,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })
}

export async function findUserCredentialsByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      createdAt: true,
    },
  })
}

export async function createRefreshToken(data: {
  tokenHash: string
  userId: string
  expiresAt: Date
}) {
  return prisma.refreshToken.create({
    data,
    select: {
      id: true,
    },
  })
}

export async function findRefreshTokenByHash(tokenHash: string) {
  return prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      revokedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
    },
  })
}

export async function rotateRefreshToken(data: {
  oldTokenId: string
  userId: string
  tokenHash: string
  expiresAt: Date
}): Promise<boolean> {
  return prisma.$transaction(async (transaction) => {
    const revokeResult = await transaction.refreshToken.updateMany({
      where: {
        id: data.oldTokenId,
        userId: data.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    })

    if (revokeResult.count !== 1) {
      return false
    }

    await transaction.refreshToken.create({
      data: {
        tokenHash: data.tokenHash,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    })

    return true
  })
}

export async function revokeRefreshToken(tokenId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      id: tokenId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  })
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  })
}
