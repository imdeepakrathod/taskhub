import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { NotFoundError } from './common/errors/httpErrors.js'
import { prisma } from './config/database.js'
import { env } from './config/env.js'
import { errorHandler } from './middlewares/errorHandler.js'
import authRouter from './modules/auth/auth.routes.js'

const app = express()

app.disable('x-powered-by')

app.use(helmet())

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
)

app.use(compression())
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
  })
})

app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`

    res.status(200).json({
      status: 'ready',
      database: 'connected',
    })
  } catch {
    res.status(503).json({
      status: 'not_ready',
      database: 'disconnected',
    })
  }
})

app.use('/api/v1/auth', authRouter)

app.use((_req, _res, next) => {
  next(new NotFoundError('Route not found', 'ROUTE_NOT_FOUND'))
})

app.use(errorHandler)

export default app
