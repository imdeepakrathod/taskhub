export type Comment = {
  id: string
  content: string
  taskId: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
  }
}
