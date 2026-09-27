import request from 'supertest'
import { describe, expect, it } from 'vitest'

import app from '../../app.js'
import { prisma } from '../../config/database.js'

const registerEndpoint = '/api/v1/auth/register'
const loginEndpoint = '/api/v1/auth/login'
const workspacesEndpoint = '/api/v1/workspaces'

const DUMMY_TEST_PASS = 'TestUser12345!'

async function createAuthenticatedUser(name = 'Test User', email = 'test@example.com') {
  const password = DUMMY_TEST_PASS

  await request(app).post(registerEndpoint).send({ name, email, password })

  const loginResponse = await request(app).post(loginEndpoint).send({ email, password })

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

async function createWorkspaceWithUser() {
  const auth = await createAuthenticatedUser('Workspace Owner', 'owner@example.com')

  const response = await request(app)
    .post(workspacesEndpoint)
    .set('Authorization', `Bearer ${auth.accessToken}`)
    .send({ name: 'Engineering Workspace' })

  return {
    auth,
    workspace: response.body.data.workspace as {
      id: string
      name: string
      slug: string
    },
  }
}

describe('Projects API Integration Tests', () => {
  describe('POST /api/v1/workspaces/:workspaceId/projects', () => {
    it('creates a new project in the workspace', async () => {
      const { auth, workspace } = await createWorkspaceWithUser()

      const response = await request(app)
        .post(`/api/v1/workspaces/${workspace.id}/projects`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({
          name: 'Core Platform v1',
          description: 'Initial release of core platform',
        })

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.data.project).toMatchObject({
        name: 'Core Platform v1',
        description: 'Initial release of core platform',
        workspaceId: workspace.id,
        createdById: auth.user.id,
      })
      expect(response.body.data.project.id).toBeTypeOf('string')

      const projectInDb = await prisma.project.findUnique({
        where: { id: response.body.data.project.id },
      })
      expect(projectInDb).not.toBeNull()
    })

    it('rejects creation when not a member of the workspace', async () => {
      const { workspace } = await createWorkspaceWithUser()
      const outsider = await createAuthenticatedUser('Outsider', 'outsider@example.com')

      const response = await request(app)
        .post(`/api/v1/workspaces/${workspace.id}/projects`)
        .set('Authorization', `Bearer ${outsider.accessToken}`)
        .send({ name: 'Unauthorized Project' })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('WORKSPACE_ACCESS_DENIED')
    })

    it('rejects invalid payloads with 400 VALIDATION_ERROR', async () => {
      const { auth, workspace } = await createWorkspaceWithUser()

      const response = await request(app)
        .post(`/api/v1/workspaces/${workspace.id}/projects`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ name: '' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/v1/workspaces/:workspaceId/projects', () => {
    it('lists all projects belonging to the workspace', async () => {
      const { auth, workspace } = await createWorkspaceWithUser()

      await request(app)
        .post(`/api/v1/workspaces/${workspace.id}/projects`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ name: 'Project A' })

      await request(app)
        .post(`/api/v1/workspaces/${workspace.id}/projects`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ name: 'Project B' })

      const response = await request(app)
        .get(`/api/v1/workspaces/${workspace.id}/projects`)
        .set('Authorization', `Bearer ${auth.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.projects).toHaveLength(2)
      expect(response.body.data.projects[0].name).toBe('Project B')
      expect(response.body.data.projects[1].name).toBe('Project A')
    })
  })

  describe('GET /api/v1/workspaces/:workspaceId/projects/:projectId', () => {
    it('returns a single project by id', async () => {
      const { auth, workspace } = await createWorkspaceWithUser()

      const createRes = await request(app)
        .post(`/api/v1/workspaces/${workspace.id}/projects`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ name: 'Project Detail Test' })

      const projectId = createRes.body.data.project.id

      const response = await request(app)
        .get(`/api/v1/workspaces/${workspace.id}/projects/${projectId}`)
        .set('Authorization', `Bearer ${auth.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data.project.name).toBe('Project Detail Test')
    })

    it('returns 404 if project does not exist', async () => {
      const { auth, workspace } = await createWorkspaceWithUser()

      const response = await request(app)
        .get(`/api/v1/workspaces/${workspace.id}/projects/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${auth.accessToken}`)

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('PROJECT_NOT_FOUND')
    })
  })

  describe('PATCH /api/v1/workspaces/:workspaceId/projects/:projectId', () => {
    it('updates project fields', async () => {
      const { auth, workspace } = await createWorkspaceWithUser()

      const createRes = await request(app)
        .post(`/api/v1/workspaces/${workspace.id}/projects`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ name: 'Old Name', description: 'Old Description' })

      const projectId = createRes.body.data.project.id

      const response = await request(app)
        .patch(`/api/v1/workspaces/${workspace.id}/projects/${projectId}`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ name: 'New Name', description: null })

      expect(response.status).toBe(200)
      expect(response.body.data.project.name).toBe('New Name')
      expect(response.body.data.project.description).toBeNull()
    })
  })

  describe('DELETE /api/v1/workspaces/:workspaceId/projects/:projectId', () => {
    it('allows OWNER to delete project', async () => {
      const { auth, workspace } = await createWorkspaceWithUser()

      const createRes = await request(app)
        .post(`/api/v1/workspaces/${workspace.id}/projects`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ name: 'To be deleted' })

      const projectId = createRes.body.data.project.id

      const response = await request(app)
        .delete(`/api/v1/workspaces/${workspace.id}/projects/${projectId}`)
        .set('Authorization', `Bearer ${auth.accessToken}`)

      expect(response.status).toBe(204)

      const check = await prisma.project.findUnique({ where: { id: projectId } })
      expect(check).toBeNull()
    })

    it('rejects deletion when user is only a MEMBER (role check)', async () => {
      const { workspace } = await createWorkspaceWithUser()

      // Add a regular MEMBER to this workspace
      const memberAuth = await createAuthenticatedUser('Regular Member', 'member@example.com')
      await prisma.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: memberAuth.user.id,
          role: 'MEMBER',
        },
      })

      // Create a project as owner first
      const ownerAuth = await createAuthenticatedUser('Owner 2', 'owner2@example.com')
      await prisma.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: ownerAuth.user.id,
          role: 'OWNER',
        },
      })
      const project = await prisma.project.create({
        data: {
          name: 'Protected Project',
          workspaceId: workspace.id,
          createdById: ownerAuth.user.id,
        },
      })

      // Regular member tries to delete
      const response = await request(app)
        .delete(`/api/v1/workspaces/${workspace.id}/projects/${project.id}`)
        .set('Authorization', `Bearer ${memberAuth.accessToken}`)

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS')

      // Verify project still exists
      const check = await prisma.project.findUnique({ where: { id: project.id } })
      expect(check).not.toBeNull()
    })
  })
})
