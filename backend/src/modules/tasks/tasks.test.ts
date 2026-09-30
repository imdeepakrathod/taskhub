import request from 'supertest'
import { describe, expect, it } from 'vitest'

import app from '../../app.js'
import { prisma } from '../../config/database.js'

const registerEndpoint = '/api/v1/auth/register'
const loginEndpoint = '/api/v1/auth/login'
const workspacesEndpoint = '/api/v1/workspaces'

const demoCredentialValue = 'xK8!uR3@qN6#'

async function createAuthenticatedUser(name = 'Test User', email = 'test@example.com') {
  const password = demoCredentialValue

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

async function setupProjectWithUser() {
  const auth = await createAuthenticatedUser('Project Lead', 'lead@example.com')

  const wsRes = await request(app)
    .post(workspacesEndpoint)
    .set('Authorization', `Bearer ${auth.accessToken}`)
    .send({ name: 'Product Workspace' })

  const workspace = wsRes.body.data.workspace as { id: string; name: string }

  const projRes = await request(app)
    .post(`/api/v1/workspaces/${workspace.id}/projects`)
    .set('Authorization', `Bearer ${auth.accessToken}`)
    .send({ name: 'Sprint Board' })

  const project = projRes.body.data.project as { id: string; name: string }

  return {
    auth,
    workspace,
    project,
  }
}

describe('Tasks API Integration Tests', () => {
  describe('POST /api/v1/projects/:projectId/tasks', () => {
    it('creates a task with default status and auto-assigned position', async () => {
      const { auth, project } = await setupProjectWithUser()

      const res1 = await request(app)
        .post(`/api/v1/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ title: 'First Task' })

      expect(res1.status).toBe(201)
      expect(res1.body.status).toBe('success')
      expect(res1.body.data.task).toMatchObject({
        title: 'First Task',
        status: 'TODO',
        priority: 'MEDIUM',
        position: 0,
        projectId: project.id,
      })

      // Second task should get position: 1
      const res2 = await request(app)
        .post(`/api/v1/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ title: 'Second Task' })

      expect(res2.status).toBe(201)
      expect(res2.body.data.task.position).toBe(1)
    })

    it('rejects task assignment if assignee is not a member of workspace', async () => {
      const { auth, project } = await setupProjectWithUser()
      const outsider = await createAuthenticatedUser('Outsider', 'outsider@example.com')

      const response = await request(app)
        .post(`/api/v1/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({
          title: 'Assigned Task',
          assigneeId: outsider.user.id,
        })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('ASSIGNEE_NOT_IN_WORKSPACE')
    })

    it('allows assigning a task to a valid workspace member', async () => {
      const { auth, workspace, project } = await setupProjectWithUser()
      const member = await createAuthenticatedUser('Team Member', 'member@example.com')

      // Add user to workspace
      await prisma.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: member.user.id,
          role: 'MEMBER',
        },
      })

      const response = await request(app)
        .post(`/api/v1/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({
          title: 'Assigned Task',
          assigneeId: member.user.id,
        })

      expect(response.status).toBe(201)
      expect(response.body.data.task.assigneeId).toBe(member.user.id)
      expect(response.body.data.task.assignee.email).toBe(member.user.email)
    })

    it('rejects creation with empty title', async () => {
      const { auth, project } = await setupProjectWithUser()

      const response = await request(app)
        .post(`/api/v1/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ title: '' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('returns 404 if project does not exist', async () => {
      const auth = await createAuthenticatedUser('User', 'user@example.com')

      const response = await request(app)
        .post('/api/v1/projects/00000000-0000-0000-0000-000000000000/tasks')
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ title: 'Task' })

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('PROJECT_NOT_FOUND')
    })
  })

  describe('GET /api/v1/projects/:projectId/tasks', () => {
    it('lists tasks sorted by position', async () => {
      const { auth, project } = await setupProjectWithUser()

      await request(app)
        .post(`/api/v1/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ title: 'Task 1' })

      await request(app)
        .post(`/api/v1/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ title: 'Task 2' })

      const response = await request(app)
        .get(`/api/v1/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${auth.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.tasks).toHaveLength(2)
      expect(response.body.data.tasks[0].title).toBe('Task 1')
      expect(response.body.data.tasks[1].title).toBe('Task 2')
    })

    it('filters tasks by status', async () => {
      const { auth, project } = await setupProjectWithUser()

      await request(app)
        .post(`/api/v1/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ title: 'Todo Task', status: 'TODO' })

      await request(app)
        .post(`/api/v1/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ title: 'Done Task', status: 'DONE' })

      const response = await request(app)
        .get(`/api/v1/projects/${project.id}/tasks?status=DONE`)
        .set('Authorization', `Bearer ${auth.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data.tasks).toHaveLength(1)
      expect(response.body.data.tasks[0].title).toBe('Done Task')
    })
  })

  describe('GET /api/v1/projects/:projectId/tasks/:taskId', () => {
    it('returns a single task by id', async () => {
      const { auth, project } = await setupProjectWithUser()

      const createRes = await request(app)
        .post(`/api/v1/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ title: 'Specific Task' })

      const taskId = createRes.body.data.task.id

      const response = await request(app)
        .get(`/api/v1/projects/${project.id}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${auth.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data.task.title).toBe('Specific Task')
    })
  })

  describe('PATCH /api/v1/projects/:projectId/tasks/:taskId', () => {
    it('updates task status, priority, and position', async () => {
      const { auth, project } = await setupProjectWithUser()

      const createRes = await request(app)
        .post(`/api/v1/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ title: 'Initial Title' })

      const taskId = createRes.body.data.task.id

      const response = await request(app)
        .patch(`/api/v1/projects/${project.id}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({
          title: 'Updated Title',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          position: 5,
        })

      expect(response.status).toBe(200)
      expect(response.body.data.task).toMatchObject({
        title: 'Updated Title',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        position: 5,
      })
    })
  })

  describe('DELETE /api/v1/projects/:projectId/tasks/:taskId', () => {
    it('deletes a task', async () => {
      const { auth, project } = await setupProjectWithUser()

      const createRes = await request(app)
        .post(`/api/v1/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ title: 'Task to Delete' })

      const taskId = createRes.body.data.task.id

      const response = await request(app)
        .delete(`/api/v1/projects/${project.id}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${auth.accessToken}`)

      expect(response.status).toBe(204)

      const inDb = await prisma.task.findUnique({ where: { id: taskId } })
      expect(inDb).toBeNull()
    })
  })
})
