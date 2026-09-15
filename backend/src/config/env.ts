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

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  throw new Error(
    `Invalid environment variables:\n${JSON.stringify(z.treeifyError(result.error), null, 2)}`,
  )
}

export const env = result.data
