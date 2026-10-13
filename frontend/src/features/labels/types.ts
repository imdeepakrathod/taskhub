export type Label = {
  id: string
  name: string
  color: string
  workspaceId: string
  createdAt: string
}

export type CreateLabelInput = {
  name: string
  color: string
}
