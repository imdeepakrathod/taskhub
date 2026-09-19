import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { REFRESH_TOKEN_COOKIE } from '../../common/utils/authCookies.js'
import app from '../../app.js'
import { getCookiePair } from '../../tests/testCookies.js'

const registerEndpoint = '/api/v1/auth/register'
const loginEndpoint = '/api/v1/auth/login'
const refreshEndpoint = '/api/v1/auth/refresh'
const logoutEndpoint = '/api/v1/auth/logout'

const credentials = {
  name: 'Deepak Rathod',
  email: 'deepak@example.com',
  password: 'SuperSecret123!',
}

async function registerAndLogin() {
  await request(app).post(registerEndpoint).send(credentials)

  return request(app).post(loginEndpoint).send({
    email: credentials.email,
    password: credentials.password,
  })
}

function getRefreshCookie(response: { headers: Record<string, unknown> }) {
  return getCookiePair(response.headers['set-cookie'], REFRESH_TOKEN_COOKIE)
}

describe('refresh token sessions', () => {
  it('rotates the refresh token and returns a new access token', async () => {
    const login = await registerAndLogin()
    const oldCookie = getRefreshCookie(login)

    const refresh = await request(app).post(refreshEndpoint).set('Cookie', oldCookie)

    expect(refresh.status).toBe(200)
    expect(refresh.body.data.accessToken.split('.')).toHaveLength(3)
    expect(refresh.body.data).not.toHaveProperty('refreshToken')

    const newCookie = getRefreshCookie(refresh)

    expect(newCookie).not.toBe(oldCookie)
  })

  it('rejects a refresh request without a cookie', async () => {
    const response = await request(app).post(refreshEndpoint)

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN')
  })

  it('rejects the old token after rotation', async () => {
    const login = await registerAndLogin()
    const oldCookie = getRefreshCookie(login)

    const refresh = await request(app).post(refreshEndpoint).set('Cookie', oldCookie)

    expect(refresh.status).toBe(200)

    const reuse = await request(app).post(refreshEndpoint).set('Cookie', oldCookie)

    expect(reuse.status).toBe(401)
    expect(reuse.body.error.code).toBe('INVALID_REFRESH_TOKEN')
  })

  it('logs out and invalidates the refresh token', async () => {
    const login = await registerAndLogin()
    const refreshCookie = getRefreshCookie(login)

    const logout = await request(app).post(logoutEndpoint).set('Cookie', refreshCookie)

    expect(logout.status).toBe(204)

    const refresh = await request(app).post(refreshEndpoint).set('Cookie', refreshCookie)

    expect(refresh.status).toBe(401)
  })
})
