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
    user: loginResponse.body.data.user as { id: string; email: string },
  }
}

async function setupTaskWithUser() {
  const auth = await createAuthenticatedUser('Task Owner', 'taskowner@example.com')

  const wsRes = await request(app)
    .post(workspacesEndpoint)
    .set('Authorization', `Bearer ${auth.accessToken}`)
    .send({ name: 'Comment Workspace' })

  const workspace = wsRes.body.data.workspace as { id: string }

  const projRes = await request(app)
    .post(`/api/v1/workspaces/${workspace.id}/projects`)
    .set('Authorization', `Bearer ${auth.accessToken}`)
    .send({ name: 'Comment Project' })

  const project = projRes.body.data.project as { id: string }

  const taskRes = await request(app)
    .post(`/api/v1/projects/${project.id}/tasks`)
    .set('Authorization', `Bearer ${auth.accessToken}`)
    .send({ title: 'Commentable Task' })

  const task = taskRes.body.data.task as { id: string }

  return { auth, workspace, project, task }
}

function commentsUrl(taskId: string) {
  return `/api/v1/tasks/${taskId}/comments`
}

describe('Comments API Integration Tests', () => {
  // ─── CREATE ────────────────────────────────────────────

  describe('POST /api/v1/tasks/:taskId/comments', () => {
    it('creates a comment on a task', async () => {
      const { auth, task } = await setupTaskWithUser()

      const response = await request(app)
        .post(commentsUrl(task.id))
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ content: 'This looks good, ship it!' })

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.data.comment).toMatchObject({
        content: 'This looks good, ship it!',
        taskId: task.id,
        author: {
          id: auth.user.id,
          email: auth.user.email,
        },
      })
      expect(response.body.data.comment.id).toBeTypeOf('string')
    })

    it('rejects empty comment content', async () => {
      const { auth, task } = await setupTaskWithUser()

      const response = await request(app)
        .post(commentsUrl(task.id))
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ content: '' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('rejects comment from non-workspace member', async () => {
      const { task } = await setupTaskWithUser()
      const outsider = await createAuthenticatedUser('Outsider', 'outsider@example.com')

      const response = await request(app)
        .post(commentsUrl(task.id))
        .set('Authorization', `Bearer ${outsider.accessToken}`)
        .send({ content: 'Sneaky comment' })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('WORKSPACE_ACCESS_DENIED')
    })

    it('returns 404 for non-existent task', async () => {
      const auth = await createAuthenticatedUser('User', 'user@example.com')

      const response = await request(app)
        .post(commentsUrl('00000000-0000-0000-0000-000000000000'))
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ content: 'Ghost comment' })

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('TASK_NOT_FOUND')
    })
  })

  // ─── LIST ──────────────────────────────────────────────

  describe('GET /api/v1/tasks/:taskId/comments', () => {
    it('lists comments in chronological order (oldest first)', async () => {
      const { auth, task } = await setupTaskWithUser()

      await request(app)
        .post(commentsUrl(task.id))
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ content: 'First comment' })

      await request(app)
        .post(commentsUrl(task.id))
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ content: 'Second comment' })

      await request(app)
        .post(commentsUrl(task.id))
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ content: 'Third comment' })

      const response = await request(app)
        .get(commentsUrl(task.id))
        .set('Authorization', `Bearer ${auth.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data.comments).toHaveLength(3)
      expect(response.body.data.comments[0].content).toBe('First comment')
      expect(response.body.data.comments[1].content).toBe('Second comment')
      expect(response.body.data.comments[2].content).toBe('Third comment')
    })

    it('returns empty array when no comments exist', async () => {
      const { auth, task } = await setupTaskWithUser()

      const response = await request(app)
        .get(commentsUrl(task.id))
        .set('Authorization', `Bearer ${auth.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data.comments).toHaveLength(0)
    })
  })

  // ─── DELETE ────────────────────────────────────────────

  describe('DELETE /api/v1/tasks/:taskId/comments/:commentId', () => {
    it('allows the author to delete their own comment', async () => {
      const { auth, task } = await setupTaskWithUser()

      const createRes = await request(app)
        .post(commentsUrl(task.id))
        .set('Authorization', `Bearer ${auth.accessToken}`)
        .send({ content: 'Temporary thought' })

      const commentId = createRes.body.data.comment.id

      const response = await request(app)
        .delete(`${commentsUrl(task.id)}/${commentId}`)
        .set('Authorization', `Bearer ${auth.accessToken}`)

      expect(response.status).toBe(204)

      const check = await prisma.comment.findUnique({ where: { id: commentId } })
      expect(check).toBeNull()
    })

    it('allows OWNER to delete another member comment (moderation)', async () => {
      const { auth: owner, workspace, task } = await setupTaskWithUser()
      const member = await createAuthenticatedUser('Team Member', 'member@example.com')

      // Add member to workspace
      await prisma.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: member.user.id,
          role: 'MEMBER',
        },
      })

      // Member posts a comment
      const createRes = await request(app)
        .post(commentsUrl(task.id))
        .set('Authorization', `Bearer ${member.accessToken}`)
        .send({ content: 'Inappropriate comment' })

      const commentId = createRes.body.data.comment.id

      // Owner deletes it
      const response = await request(app)
        .delete(`${commentsUrl(task.id)}/${commentId}`)
        .set('Authorization', `Bearer ${owner.accessToken}`)

      expect(response.status).toBe(204)
    })

    it('rejects member deleting another member comment', async () => {
      const { workspace, task } = await setupTaskWithUser()
      const memberA = await createAuthenticatedUser('Member A', 'membera@example.com')
      const memberB = await createAuthenticatedUser('Member B', 'memberb@example.com')

      // Add both to workspace
      await prisma.workspaceMember.create({
        data: { workspaceId: workspace.id, userId: memberA.user.id, role: 'MEMBER' },
      })
      await prisma.workspaceMember.create({
        data: { workspaceId: workspace.id, userId: memberB.user.id, role: 'MEMBER' },
      })

      // Member A posts a comment
      const createRes = await request(app)
        .post(commentsUrl(task.id))
        .set('Authorization', `Bearer ${memberA.accessToken}`)
        .send({ content: 'My comment' })

      const commentId = createRes.body.data.comment.id

      // Member B tries to delete it
      const response = await request(app)
        .delete(`${commentsUrl(task.id)}/${commentId}`)
        .set('Authorization', `Bearer ${memberB.accessToken}`)

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('COMMENT_DELETE_FORBIDDEN')

      // Verify comment still exists
      const check = await prisma.comment.findUnique({ where: { id: commentId } })
      expect(check).not.toBeNull()
    })

    it('returns 404 for non-existent comment', async () => {
      const { auth, task } = await setupTaskWithUser()

      const response = await request(app)
        .delete(`${commentsUrl(task.id)}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${auth.accessToken}`)

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('COMMENT_NOT_FOUND')
    })
  })
})
