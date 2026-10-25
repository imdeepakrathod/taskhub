import http from 'node:http'

import app from './app.js'
import { prisma } from './config/database.js'
import { env } from './config/env.js'
import { initSocketServer } from './config/socket.js'

async function startServer() {
  try {
    await prisma.$connect()

    console.warn('PostgreSQL connected successfully')

    // Create Node HTTP server wrapping Express app
    const httpServer = http.createServer(app)

    // Attach Socket.IO to HTTP server
    initSocketServer(httpServer)

    httpServer.listen(env.PORT, () => {
      console.warn(`Server running at http://localhost:${env.PORT}`)
      console.warn(`WebSocket server initialized on port ${env.PORT}`)
    })

    let isShuttingDown = false

    const shutdown = async (signal: string) => {
      if (isShuttingDown) {
        return
      }

      isShuttingDown = true

      console.warn(`${signal} received, shutting down`)

      httpServer.close(async (error) => {
        try {
          await prisma.$disconnect()

          if (error) {
            console.error('HTTP server shutdown failed:', error)
            process.exit(1)
          }

          console.warn('Server stopped successfully')
          process.exit(0)
        } catch (disconnectError: unknown) {
          console.error('Database disconnect failed:', disconnectError)
          process.exit(1)
        }
      })
    }

    process.on('SIGTERM', () => {
      void shutdown('SIGTERM')
    })

    process.on('SIGINT', () => {
      void shutdown('SIGINT')
    })
  } catch (error: unknown) {
    console.error('Server startup failed:', error)

    await prisma.$disconnect().catch(() => undefined)

    process.exit(1)
  }
}

void startServer()
