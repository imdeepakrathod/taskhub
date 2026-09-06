import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { prisma } from './config/database.js'
import { env } from './config/env.js'

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

export default app
