import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'

import { bootstrapSession, login, logout, register } from '../api/authApi'
import { AuthContext, type AuthContextValue } from '../AuthContext'
import { authSession } from '../authSession'

type AuthProviderProps = {
  children: ReactNode
}

let bootstrapPromise: Promise<void> | null = null

function runAuthBootstrap(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapSession()
  }

  return bootstrapPromise
}

export function AuthProvider({ children }: AuthProviderProps) {
  const session = useSyncExternalStore(
    authSession.subscribe,
    authSession.getSnapshot,
    authSession.getSnapshot,
  )

  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    let active = true

    void runAuthBootstrap().finally(() => {
      if (active) {
        setIsBootstrapping(false)
      }
    })

    return () => {
      active = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: session !== null,
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [session, isBootstrapping],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
