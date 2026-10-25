import { io, type Socket } from 'socket.io-client'

import { authSession } from '../features/auth/authSession'

let socket: Socket | null = null

export function getSocket(): Socket {
  const token = authSession.getAccessToken()

  if (!socket) {
    socket = io({
      autoConnect: false,
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    })
  }

  // Update token before connection if it changed
  if (token && socket.auth) {
    socket.auth = { token }
  }

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
