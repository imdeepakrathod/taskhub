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
