export type AuthUser = {
  id: string
  name: string
  email: string
  createdAt: string
}

export type AuthSession = {
  user: AuthUser
  accessToken: string
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  name: string
  email: string
  password: string
}

export type ApiSuccess<T> = {
  status: 'success'
  data: T
}
