export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export type Workspace = {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
  role: WorkspaceRole
}

export type CreateWorkspaceInput = {
  name: string
}
