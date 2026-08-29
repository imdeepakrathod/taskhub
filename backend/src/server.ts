import app from './app.js'
import { env } from './config/env.js'

const PORT = env.PORT

const server = app.listen(PORT, () => {
  console.warn(`Server running on http://localhost:${PORT}`)
})

const shutdown = (signal: string) => {
  console.warn(`${signal} received, shutting down`)
  server.close(() => process.exit(0))
}

console.warn({
  environment: env.NODE_ENV,
  port: env.PORT,
  corsOrigin: env.CORS_ORIGIN,
})

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
