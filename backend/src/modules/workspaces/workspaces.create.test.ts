import request from 'supertest'
import { describe, expect, it } from 'vitest'

import app from '../../app.js'
import { prisma } from '../../config/database.js'

const registerEndpoint = '/api/v1/auth/register'
const loginEndpoint = '/api/v1/auth/login'
const workspacesEndpoint = '/api/v1/workspaces'

const userPayload = {
  name: 'Deepak Rathod',
  email: 'deepak@example.com',
  password: 'SuperSecret123!',
}

async function createAuthenticatedUser() {
  await request(app).post(registerEndpoint).send(userPayload)

  const loginResponse = await request(app).post(loginEndpoint).send({
    email: userPayload.email,
    password: userPayload.password,
  })

  if (loginResponse.status !== 200) {
    throw new Error('Failed to create authenticated test user')
  }

  return {
    accessToken: loginResponse.body.data.accessToken as string,
    user: loginResponse.body.data.user as {
      id: string
      email: string
    },
  }
}

describe(`POST ${workspacesEndpoint}`, () => {
  it('creates a workspace and makes the creator its owner', async () => {
    const auth = await createAuthenticatedUser()

    const response = await request(app)
      .post(workspacesEndpoint)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        name: 'TaskHub Engineering',
      })

    expect(response.status).toBe(201)
    expect(response.body.status).toBe('success')
    expect(response.body.data.workspace).toMatchObject({
      name: 'TaskHub Engineering',
      slug: 'taskhub-engineering',
      role: 'OWNER',
    })

    expect(response.body.data.workspace.id).toBeTypeOf('string')
    expect(response.body.data.workspace.createdAt).toBeDefined()

    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: auth.user.id,
        workspaceId: response.body.data.workspace.id,
      },
    })

    expect(membership).not.toBeNull()
    expect(membership?.role).toBe('OWNER')
  })

  it('creates exactly one workspace and one owner membership', async () => {
    const auth = await createAuthenticatedUser()

    const response = await request(app)
      .post(workspacesEndpoint)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        name: 'Product Team',
      })

    expect(response.status).toBe(201)
    expect(await prisma.workspace.count()).toBe(1)
    expect(await prisma.workspaceMember.count()).toBe(1)
  })

  it('trims the workspace name and generates its slug', async () => {
    const auth = await createAuthenticatedUser()

    const response = await request(app)
      .post(workspacesEndpoint)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        name: '  Product Design Team  ',
      })

    expect(response.status).toBe(201)
    expect(response.body.data.workspace.name).toBe('Product Design Team')
    expect(response.body.data.workspace.slug).toBe('product-design-team')
  })

  it('generates unique slugs for workspaces with the same name', async () => {
    const auth = await createAuthenticatedUser()

    const first = await request(app)
      .post(workspacesEndpoint)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        name: 'Engineering',
      })

    const second = await request(app)
      .post(workspacesEndpoint)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        name: 'Engineering',
      })

    expect(first.status).toBe(201)
    expect(second.status).toBe(201)

    expect(first.body.data.workspace.slug).toBe('engineering')
    expect(second.body.data.workspace.slug).toMatch(/^engineering-[a-f0-9]{6}$/)
    expect(second.body.data.workspace.slug).not.toBe(first.body.data.workspace.slug)

    expect(await prisma.workspace.count()).toBe(2)
    expect(await prisma.workspaceMember.count()).toBe(2)
  })

  it('rejects a request without an access token', async () => {
    const response = await request(app).post(workspacesEndpoint).send({
      name: 'Unauthorized Workspace',
    })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHENTICATED')
    expect(await prisma.workspace.count()).toBe(0)
  })

  it('rejects an invalid access token', async () => {
    const response = await request(app)
      .post(workspacesEndpoint)
      .set('Authorization', 'Bearer invalid.token.value')
      .send({
        name: 'Unauthorized Workspace',
      })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('INVALID_TOKEN')
    expect(await prisma.workspace.count()).toBe(0)
  })

  it.each([
    ['missing name', {}],
    ['empty name', { name: '' }],
    ['whitespace-only name', { name: '   ' }],
    ['short name', { name: 'A' }],
    ['unknown field', { name: 'Engineering', ownerId: 'fake-id' }],
  ])('rejects %s with 400 VALIDATION_ERROR', async (_label, payload) => {
    const auth = await createAuthenticatedUser()

    const response = await request(app)
      .post(workspacesEndpoint)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send(payload)

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(await prisma.workspace.count()).toBe(0)
    expect(await prisma.workspaceMember.count()).toBe(0)
  })

  it('does not expose membership internals in the response', async () => {
    const auth = await createAuthenticatedUser()

    const response = await request(app)
      .post(workspacesEndpoint)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        name: 'Safe Response Workspace',
      })

    expect(response.status).toBe(201)

    const workspace = response.body.data.workspace

    expect(workspace).not.toHaveProperty('members')
    expect(workspace).not.toHaveProperty('userId')
    expect(workspace).not.toHaveProperty('workspaceId')
  })

  it('deletes memberships when the user is deleted', async () => {
    const auth = await createAuthenticatedUser()

    const response = await request(app)
      .post(workspacesEndpoint)
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .send({
        name: 'Cascade Test',
      })

    expect(response.status).toBe(201)
    expect(await prisma.workspaceMember.count()).toBe(1)

    await prisma.user.delete({
      where: {
        id: auth.user.id,
      },
    })

    expect(await prisma.workspaceMember.count()).toBe(0)
    expect(await prisma.workspace.count()).toBe(1)
  })
})
