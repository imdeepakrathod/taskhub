export type ActivityAction =
  | 'TASK_CREATED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_PRIORITY_CHANGED'
  | 'TASK_ASSIGNEE_CHANGED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'COMMENT_CREATED'

export type ActivityLog = {
  id: string
  action: ActivityAction
  entityType: string
  entityId: string
  metadata: Record<string, unknown> | null
  createdAt: string
  actor: {
    id: string
    name: string
    email: string
  }
}
