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

async function setupWorkspaceWithOwner() {
  const owner = await createAuthenticatedUser('Workspace Owner', 'owner@example.com')

  const res = await request(app)
    .post(workspacesEndpoint)
    .set('Authorization', `Bearer ${owner.accessToken}`)
    .send({ name: 'Team Workspace' })

  return {
    owner,
    workspace: res.body.data.workspace as { id: string; name: string },
  }
}

function membersUrl(workspaceId: string) {
  return `/api/v1/workspaces/${workspaceId}/members`
}

describe('Members API Integration Tests', () => {
  // ─── LIST ──────────────────────────────────────────────

  describe('GET /api/v1/workspaces/:workspaceId/members', () => {
    it('returns the owner as the only member after workspace creation', async () => {
      const { owner, workspace } = await setupWorkspaceWithOwner()

      const response = await request(app)
        .get(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data.members).toHaveLength(1)
      expect(response.body.data.members[0]).toMatchObject({
        role: 'OWNER',
        user: {
          email: owner.user.email,
        },
      })
    })

    it('rejects non-members from listing', async () => {
      const { workspace } = await setupWorkspaceWithOwner()
      const outsider = await createAuthenticatedUser('Outsider', 'outsider@example.com')

      const response = await request(app)
        .get(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${outsider.accessToken}`)

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('WORKSPACE_ACCESS_DENIED')
    })
  })

  // ─── ADD ───────────────────────────────────────────────

  describe('POST /api/v1/workspaces/:workspaceId/members', () => {
    it('adds a user to the workspace by email', async () => {
      const { owner, workspace } = await setupWorkspaceWithOwner()
      const newUser = await createAuthenticatedUser('New Member', 'newmember@example.com')

      const response = await request(app)
        .post(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: newUser.user.email })

      expect(response.status).toBe(201)
      expect(response.body.data.member).toMatchObject({
        role: 'MEMBER',
        user: {
          email: newUser.user.email,
        },
      })

      // Verify: workspace now has 2 members
      const list = await request(app)
        .get(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)

      expect(list.body.data.members).toHaveLength(2)
    })

    it('adds a user with a specific role', async () => {
      const { owner, workspace } = await setupWorkspaceWithOwner()
      const admin = await createAuthenticatedUser('Admin User', 'admin@example.com')

      const response = await request(app)
        .post(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: admin.user.email, role: 'ADMIN' })

      expect(response.status).toBe(201)
      expect(response.body.data.member.role).toBe('ADMIN')
    })

    it('returns 404 if email does not belong to any user', async () => {
      const { owner, workspace } = await setupWorkspaceWithOwner()

      const response = await request(app)
        .post(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: 'nobody@example.com' })

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('USER_NOT_FOUND')
    })

    it('returns 409 if user is already a member', async () => {
      const { owner, workspace } = await setupWorkspaceWithOwner()
      const user = await createAuthenticatedUser('Duplicate', 'dup@example.com')

      // Add once
      await request(app)
        .post(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: user.user.email })

      // Add again
      const response = await request(app)
        .post(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: user.user.email })

      expect(response.status).toBe(409)
      expect(response.body.error.code).toBe('MEMBER_ALREADY_EXISTS')
    })

    it('rejects add when caller is only a MEMBER', async () => {
      const { owner, workspace } = await setupWorkspaceWithOwner()
      const member = await createAuthenticatedUser('Regular', 'regular@example.com')
      const target = await createAuthenticatedUser('Target', 'target@example.com')

      // Add as MEMBER
      await request(app)
        .post(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: member.user.email })

      // MEMBER tries to add someone
      const response = await request(app)
        .post(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${member.accessToken}`)
        .send({ email: target.user.email })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS')
    })
  })

  // ─── UPDATE ROLE ───────────────────────────────────────

  describe('PATCH /api/v1/workspaces/:workspaceId/members/:memberId', () => {
    it('allows OWNER to promote MEMBER to ADMIN', async () => {
      const { owner, workspace } = await setupWorkspaceWithOwner()
      const user = await createAuthenticatedUser('Promotee', 'promotee@example.com')

      const addRes = await request(app)
        .post(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: user.user.email })

      const memberId = addRes.body.data.member.id

      const response = await request(app)
        .patch(`${membersUrl(workspace.id)}/${memberId}`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ role: 'ADMIN' })

      expect(response.status).toBe(200)
      expect(response.body.data.member.role).toBe('ADMIN')
    })

    it('rejects changing the OWNER role', async () => {
      const { owner, workspace } = await setupWorkspaceWithOwner()

      // Find the owner's membership ID
      const listRes = await request(app)
        .get(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)

      const ownerMemberId = listRes.body.data.members[0].id

      const response = await request(app)
        .patch(`${membersUrl(workspace.id)}/${ownerMemberId}`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ role: 'MEMBER' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('CANNOT_MODIFY_OWNER')
    })

    it('rejects role change when caller is ADMIN (only OWNER can)', async () => {
      const { owner, workspace } = await setupWorkspaceWithOwner()
      const admin = await createAuthenticatedUser('Admin', 'admin@example.com')
      const member = await createAuthenticatedUser('Member', 'member@example.com')

      // Add admin
      await request(app)
        .post(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: admin.user.email, role: 'ADMIN' })

      // Add member
      const addRes = await request(app)
        .post(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: member.user.email })

      const memberId = addRes.body.data.member.id

      // Admin tries to change member's role
      const response = await request(app)
        .patch(`${membersUrl(workspace.id)}/${memberId}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ role: 'ADMIN' })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS')
    })
  })

  // ─── REMOVE ────────────────────────────────────────────

  describe('DELETE /api/v1/workspaces/:workspaceId/members/:memberId', () => {
    it('allows OWNER to remove a member', async () => {
      const { owner, workspace } = await setupWorkspaceWithOwner()
      const user = await createAuthenticatedUser('Removable', 'removable@example.com')

      const addRes = await request(app)
        .post(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: user.user.email })

      const memberId = addRes.body.data.member.id

      const response = await request(app)
        .delete(`${membersUrl(workspace.id)}/${memberId}`)
        .set('Authorization', `Bearer ${owner.accessToken}`)

      expect(response.status).toBe(204)

      // Verify removed
      const check = await prisma.workspaceMember.findUnique({
        where: { id: memberId },
      })
      expect(check).toBeNull()
    })

    it('rejects removing the workspace OWNER', async () => {
      const { owner, workspace } = await setupWorkspaceWithOwner()

      const listRes = await request(app)
        .get(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)

      const ownerMemberId = listRes.body.data.members[0].id

      const response = await request(app)
        .delete(`${membersUrl(workspace.id)}/${ownerMemberId}`)
        .set('Authorization', `Bearer ${owner.accessToken}`)

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('CANNOT_REMOVE_OWNER')
    })

    it('rejects removal when caller is only a MEMBER', async () => {
      const { owner, workspace } = await setupWorkspaceWithOwner()
      const member = await createAuthenticatedUser('Member', 'member@example.com')
      const target = await createAuthenticatedUser('Target', 'target@example.com')

      // Add both as MEMBER
      await request(app)
        .post(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: member.user.email })

      const addRes = await request(app)
        .post(membersUrl(workspace.id))
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: target.user.email })

      const targetMemberId = addRes.body.data.member.id

      // MEMBER tries to remove another member
      const response = await request(app)
        .delete(`${membersUrl(workspace.id)}/${targetMemberId}`)
        .set('Authorization', `Bearer ${member.accessToken}`)

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS')
    })
  })
})
