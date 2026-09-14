import request from 'supertest'
import { describe, expect, it } from 'vitest'

import app from '../../app.js'
import { prisma } from '../../config/database.js'

const endpoint = '/api/v1/auth/register'

const validPayload = {
  name: 'Deepak Rathod',
  email: 'deepak@example.com',
  password: 'SuperSecret123!',
}

describe(`POST ${endpoint}`, () => {
  it('creates a user and returns 201 with safe fields only', async () => {
    const res = await request(app).post(endpoint).send(validPayload)

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('success')
    expect(res.body.data.user).toMatchObject({
      name: validPayload.name,
      email: validPayload.email,
    })
    expect(res.body.data.user.id).toBeTypeOf('string')
    expect(res.body.data.user).not.toHaveProperty('passwordHash')
    expect(res.body.data.user).not.toHaveProperty('password')
  })

  it('stores a hash, never the plaintext password', async () => {
    await request(app).post(endpoint).send(validPayload)

    const user = await prisma.user.findUnique({
      where: { email: validPayload.email },
    })

    expect(user).not.toBeNull()
    expect(user!.passwordHash).not.toBe(validPayload.password)
    expect(user!.passwordHash.startsWith('$argon2id$')).toBe(true)
  })

  it('normalises the email to lowercase', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ ...validPayload, email: 'DeePak@Example.COM' })

    expect(res.status).toBe(201)
    expect(res.body.data.user.email).toBe('deepak@example.com')
  })

  it('trims surrounding whitespace from the name', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ ...validPayload, name: '  Deepak Rathod  ' })

    expect(res.status).toBe(201)
    expect(res.body.data.user.name).toBe('Deepak Rathod')
  })

  it('rejects a duplicate email with 409', async () => {
    await request(app).post(endpoint).send(validPayload)
    const res = await request(app).post(endpoint).send(validPayload)

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS')
    expect(await prisma.user.count()).toBe(1)
  })

  it('treats a differently-cased duplicate email as a conflict', async () => {
    await request(app).post(endpoint).send(validPayload)
    const res = await request(app)
      .post(endpoint)
      .send({ ...validPayload, email: 'DEEPAK@EXAMPLE.COM' })

    expect(res.status).toBe(409)
  })

  it.each([
    ['missing name', { email: validPayload.email, password: validPayload.password }],
    ['short name', { ...validPayload, name: 'D' }],
    ['invalid email', { ...validPayload, email: 'not-an-email' }],
    ['short password', { ...validPayload, password: 'short' }],
    ['unknown extra field', { ...validPayload, role: 'admin' }],
    ['empty body', {}],
  ])('rejects %s with 400 VALIDATION_ERROR', async (_label, payload) => {
    const res = await request(app).post(endpoint).send(payload)

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(await prisma.user.count()).toBe(0)
  })

  it('does not leak internals on an unknown route', async () => {
    const res = await request(app).post('/api/v1/auth/does-not-exist')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND')
    expect(JSON.stringify(res.body)).not.toMatch(/stack|prisma|at .*\.ts:/i)
  })
})
