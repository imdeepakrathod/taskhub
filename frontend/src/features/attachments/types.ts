export type Attachment = {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  taskId: string
  createdAt: string
  uploader: {
    id: string
    name: string
    email: string
  }
}
