import { publicApi, restoreAuthSession } from '../../../lib/axios'

import { authSession } from '../authSession'
import type { ApiSuccess, AuthSession, AuthUser, LoginInput, RegisterInput } from '../types'

export async function login(input: LoginInput): Promise<AuthSession> {
  const response = await publicApi.post<ApiSuccess<AuthSession>>('/auth/login', input)

  const session = response.data.data

  authSession.setSession(session)

  return session
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const response = await publicApi.post<ApiSuccess<{ user: AuthUser }>>('/auth/register', input)

  return response.data.data.user
}

export async function logout(): Promise<void> {
  try {
    await publicApi.post('/auth/logout')
  } finally {
    authSession.clearSession()
  }
}

export async function bootstrapSession(): Promise<void> {
  try {
    await restoreAuthSession()
  } catch {
    authSession.clearSession()
  }
}
