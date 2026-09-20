import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { authSession } from '../features/auth/authSession'
import type { ApiSuccess, AuthSession } from '../features/auth/types'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const accessToken = authSession.getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let refreshPromise: Promise<AuthSession> | null = null

function shouldSkipAutomaticRefresh(url?: string): boolean {
  if (!url) {
    return false
  }

  return ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'].some((path) =>
    url.includes(path),
  )
}

async function requestNewSession(): Promise<AuthSession> {
  const response = await publicApi.post<ApiSuccess<AuthSession>>('/auth/refresh')

  const session = response.data.data

  authSession.setSession(session)

  return session
}

export async function restoreAuthSession(): Promise<AuthSession> {
  return requestNewSession()
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      originalRequest !== undefined &&
      !originalRequest._retry &&
      !shouldSkipAutomaticRefresh(originalRequest.url)

    if (!shouldAttemptRefresh || !originalRequest) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = requestNewSession().finally(() => {
          refreshPromise = null
        })
      }

      const session = await refreshPromise

      originalRequest.headers.Authorization = `Bearer ${session.accessToken}`

      return api(originalRequest)
    } catch (refreshError: unknown) {
      authSession.clearSession()

      return Promise.reject(refreshError)
    }
  },
)
