import { config } from 'dotenv'
import { afterAll, beforeEach } from 'vitest'

if (!process.env.CI) {
  config({ path: '.env.test', override: true })
}

const databaseUrl = process.env.DATABASE_URL ?? ''

if (!databaseUrl.includes('taskhub_test')) {
  throw new Error(
    `Refusing to run tests: DATABASE_URL must target a test database, got "${databaseUrl}"`,
  )
}

const { prisma } = await import('../config/database.js')

beforeEach(async () => {
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
