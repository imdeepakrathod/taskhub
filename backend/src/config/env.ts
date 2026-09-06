import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  PORT: z.coerce.number().int().positive().default(4000),

  CLIENT_URL: z.url(),

  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .startsWith('postgresql://', 'DATABASE_URL must be a PostgreSQL URL'),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error('Invalid environment variables:')

  console.error(z.treeifyError(result.error))

  process.exit(1)
}

export const env = result.data
