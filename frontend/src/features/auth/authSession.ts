import type { AuthSession } from './types'

type AuthSessionState = AuthSession | null

type Listener = () => void

let currentSession: AuthSessionState = null

const listeners = new Set<Listener>()

function emitChange(): void {
  listeners.forEach((listener) => {
    listener()
  })
}

export const authSession = {
  getSnapshot(): AuthSessionState {
    return currentSession
  },

  getAccessToken(): string | null {
    return currentSession?.accessToken ?? null
  },

  setSession(session: AuthSession): void {
    currentSession = session
    emitChange()
  },

  clearSession(): void {
    currentSession = null
    emitChange()
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  },
}
