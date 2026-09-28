export type Project = {
  id: string
  name: string
  description: string | null
  workspaceId: string
  createdById: string
  createdAt: string
  updatedAt: string
}

export type CreateProjectInput = {
  name: string
  description?: string
}
