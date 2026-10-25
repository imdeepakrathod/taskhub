import type { Server as HttpServer } from 'node:http'
import jwt from 'jsonwebtoken'
import { Server, type Socket } from 'socket.io'

import { env } from './env.js'

type AuthenticatedSocket = Socket & {
  data: {
    user?: {
      id: string
      email: string
    }
  }
}

let io: Server | null = null

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // ── Authentication Middleware ──────────────────────────
  io.use((socket: AuthenticatedSocket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '')

    if (!token || typeof token !== 'string') {
      return next(new Error('Authentication required for socket connection'))
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        sub: string
        email: string
      }

      socket.data.user = {
        id: decoded.sub,
        email: decoded.email,
      }

      next()
    } catch {
      next(new Error('Invalid or expired socket authentication token'))
    }
  })

  // ── Connection & Room Management ──────────────────────
  io.on('connection', (socket: AuthenticatedSocket) => {
    // When a user opens a project board, they join that project's room
    socket.on('project:join', (projectId: string) => {
      if (typeof projectId === 'string') {
        void socket.join(`project:${projectId}`)
      }
    })

    // When leaving the board
    socket.on('project:leave', (projectId: string) => {
      if (typeof projectId === 'string') {
        void socket.leave(`project:${projectId}`)
      }
    })
  })

  return io
}

export function getSocketServer(): Server | null {
  return io
}

// ── Helper to broadcast events to a specific project room ──
export function emitToProject<T>(projectId: string, event: string, data: T): void {
  if (io) {
    io.to(`project:${projectId}`).emit(event, data)
  }
}
