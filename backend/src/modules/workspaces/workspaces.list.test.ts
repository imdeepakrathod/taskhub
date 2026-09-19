import request from 'supertest'
import { describe, expect, it } from 'vitest'

import app from '../../app.js'

const registerEndpoint = '/api/v1/auth/register'
const loginEndpoint = '/api/v1/auth/login'
const workspacesEndpoint = '/api/v1/workspaces'

type UserCredentials = {
  name: string
  email: string
  password: string
}

const firstUser: UserCredentials = {
  name: 'Deepak Rathod',
  email: 'deepak@example.com',
  password: 'SuperSecret123!',
}

const secondUser: UserCredentials = {
  name: 'Second User',
  email: 'second@example.com',
  password: 'AnotherSecret123!',
}

async function registerAndLogin(credentials: UserCredentials) {
  const registration = await request(app).post(registerEndpoint).send(credentials)

  if (registration.status !== 201) {
    throw new Error('Failed to register test user')
  }

  const login = await request(app).post(loginEndpoint).send({
    email: credentials.email,
    password: credentials.password,
  })

  if (login.status !== 200) {
    throw new Error('Failed to log in test user')
  }

  return login.body.data.accessToken as string
}

async function createWorkspace(accessToken: string, name: string) {
  const response = await request(app)
    .post(workspacesEndpoint)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ name })

  if (response.status !== 201) {
    throw new Error(`Failed to create workspace "${name}"`)
  }

  return response.body.data.workspace
}

describe(`GET ${workspacesEndpoint}`, () => {
  it('returns an empty array when the user has no workspaces', async () => {
    const accessToken = await registerAndLogin(firstUser)

    const response = await request(app)
      .get(workspacesEndpoint)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      status: 'success',
      data: {
        workspaces: [],
      },
    })
  })

  it('returns every workspace belonging to the current user', async () => {
    const accessToken = await registerAndLogin(firstUser)

    await createWorkspace(accessToken, 'Engineering')
    await createWorkspace(accessToken, 'Product Design')

    const response = await request(app)
      .get(workspacesEndpoint)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body.data.workspaces).toHaveLength(2)

    expect(response.body.data.workspaces).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Engineering',
          slug: 'engineering',
          role: 'OWNER',
        }),
        expect.objectContaining({
          name: 'Product Design',
          slug: 'product-design',
          role: 'OWNER',
        }),
      ]),
    )
  })

  it('does not return workspaces belonging to another user', async () => {
    const firstToken = await registerAndLogin(firstUser)
    const secondToken = await registerAndLogin(secondUser)

    await createWorkspace(firstToken, 'First User Workspace')
    await createWorkspace(secondToken, 'Second User Workspace')

    const response = await request(app)
      .get(workspacesEndpoint)
      .set('Authorization', `Bearer ${firstToken}`)

    expect(response.status).toBe(200)
    expect(response.body.data.workspaces).toHaveLength(1)
    expect(response.body.data.workspaces[0]).toMatchObject({
      name: 'First User Workspace',
      role: 'OWNER',
    })

    expect(
      response.body.data.workspaces.some(
        (workspace: { name: string }) => workspace.name === 'Second User Workspace',
      ),
    ).toBe(false)
  })

  it('includes the current user role for each workspace', async () => {
    const accessToken = await registerAndLogin(firstUser)

    await createWorkspace(accessToken, 'Role Test Workspace')

    const response = await request(app)
      .get(workspacesEndpoint)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body.data.workspaces[0].role).toBe('OWNER')
  })

  it('does not expose membership internals', async () => {
    const accessToken = await registerAndLogin(firstUser)

    await createWorkspace(accessToken, 'Safe Workspace')

    const response = await request(app)
      .get(workspacesEndpoint)
      .set('Authorization', `Bearer ${accessToken}`)

    const workspace = response.body.data.workspaces[0]

    expect(workspace).not.toHaveProperty('userId')
    expect(workspace).not.toHaveProperty('workspaceId')
    expect(workspace).not.toHaveProperty('members')
    expect(workspace).not.toHaveProperty('membership')
  })

  it('rejects a request without an access token', async () => {
    const response = await request(app).get(workspacesEndpoint)

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects an invalid access token', async () => {
    const response = await request(app)
      .get(workspacesEndpoint)
      .set('Authorization', 'Bearer invalid.token.value')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('INVALID_TOKEN')
  })
})
