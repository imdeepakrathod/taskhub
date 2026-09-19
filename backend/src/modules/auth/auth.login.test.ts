import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { REFRESH_TOKEN_COOKIE } from '../../common/utils/authCookies.js'
import { getSetCookieHeader } from '../../tests/testCookies.js'

import app from '../../app.js'

const registerEndpoint = '/api/v1/auth/register'
const loginEndpoint = '/api/v1/auth/login'

const credentials = {
  name: 'Deepak Rathod',
  email: 'deepak@example.com',
  password: 'SuperSecret123!',
}

describe(`POST ${loginEndpoint}`, () => {
  beforeEach(async () => {
    await request(app).post(registerEndpoint).send(credentials)
  })

  it('returns 200 with an access token and safe user fields', async () => {
    const res = await request(app)
      .post(loginEndpoint)
      .send({ email: credentials.email, password: credentials.password })

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken.split('.')).toHaveLength(3)
    expect(res.body.data.user.email).toBe(credentials.email)
    expect(res.body.data.user).not.toHaveProperty('passwordHash')
  })

  it('accepts a differently-cased email', async () => {
    const res = await request(app)
      .post(loginEndpoint)
      .send({ email: 'DEEPAK@EXAMPLE.COM', password: credentials.password })

    expect(res.status).toBe(200)
  })

  it('rejects a wrong password with a generic 401', async () => {
    const res = await request(app)
      .post(loginEndpoint)
      .send({ email: credentials.email, password: 'WrongPassword123!' })

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('returns the identical error for an unknown email', async () => {
    const unknown = await request(app)
      .post(loginEndpoint)
      .send({ email: 'nobody@example.com', password: credentials.password })
    const wrongPassword = await request(app)
      .post(loginEndpoint)
      .send({ email: credentials.email, password: 'WrongPassword123!' })

    // Identical responses prevent user enumeration
    expect(unknown.status).toBe(wrongPassword.status)
    expect(unknown.body).toEqual(wrongPassword.body)
  })

  it.each([
    ['missing password', { email: credentials.email }],
    ['invalid email', { email: 'not-an-email', password: credentials.password }],
    ['extra field', { ...credentials, role: 'admin' }],
    ['empty body', {}],
  ])('rejects %s with 400 VALIDATION_ERROR', async (_label, payload) => {
    const res = await request(app).post(loginEndpoint).send(payload)

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns an access token and sets an httpOnly refresh cookie', async () => {
    const res = await request(app).post(loginEndpoint).send({
      email: credentials.email,
      password: credentials.password,
    })

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken.split('.')).toHaveLength(3)
    expect(res.body.data.user.email).toBe(credentials.email)
    expect(res.body.data.user).not.toHaveProperty('passwordHash')

    const cookieHeader = getSetCookieHeader(res.headers['set-cookie'], REFRESH_TOKEN_COOKIE)

    expect(cookieHeader).toContain(`${REFRESH_TOKEN_COOKIE}=`)
    expect(cookieHeader.toLowerCase()).toContain('httponly')
  })
})

describe('GET /api/v1/auth/me', () => {
  it('returns the caller with a valid token', async () => {
    await request(app).post(registerEndpoint).send(credentials)
    const login = await request(app)
      .post(loginEndpoint)
      .send({ email: credentials.email, password: credentials.password })

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.user.email).toBe(credentials.email)
  })

  it.each([
    ['no header', undefined],
    ['wrong scheme', 'Basic abc'],
    ['garbage token', 'Bearer not.a.jwt'],
  ])('rejects %s with 401', async (_label, header) => {
    const req = request(app).get('/api/v1/auth/me')
    const res = header ? await req.set('Authorization', header) : await req

    expect(res.status).toBe(401)
  })
})
