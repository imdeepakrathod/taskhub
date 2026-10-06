export type Member = {
  id: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export type AddMemberInput = {
  email: string
  role?: 'ADMIN' | 'MEMBER'
}

export type UpdateMemberRoleInput = {
  role: 'ADMIN' | 'MEMBER'
}
