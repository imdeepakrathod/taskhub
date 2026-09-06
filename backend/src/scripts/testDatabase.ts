import { prisma } from '../config/database.js'

async function main() {
  console.warn('Testing PostgreSQL connection...')

  const databaseResult = await prisma.$queryRaw<
    Array<{
      database_name: string
      database_user: string
    }>
  >`
    SELECT
      current_database() AS database_name,
      current_user AS database_user
  `

  console.warn('Connected:', databaseResult[0])

  const user = await prisma.user.upsert({
    where: {
      email: 'deepak@example.com',
    },

    update: {
      name: 'Deepak Rathod',
    },

    create: {
      name: 'Deepak Rathod',
      email: 'deepak@example.com',
      passwordHash: 'temporary-test-hash',
    },

    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })

  console.warn('Test user:', user)

  const userCount = await prisma.user.count()

  console.warn('Total users:', userCount)
}

main()
  .catch((error: unknown) => {
    console.error('Database test failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
