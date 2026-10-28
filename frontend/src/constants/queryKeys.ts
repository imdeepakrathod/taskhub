export const queryKeys = {
  workspaces: {
    all: ['workspaces'] as const,
  },
  projects: {
    all: ['projects'] as const,
    byWorkspace: (workspaceId: string) => ['projects', workspaceId] as const,
    analytics: (workspaceId: string, projectId: string) =>
      ['projects', workspaceId, projectId, 'analytics'] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    byProject: (projectId: string) => ['tasks', projectId] as const,
  },
  members: {
    byWorkspace: (workspaceId: string) => ['members', workspaceId] as const,
  },
  comments: {
    byTask: (taskId: string) => ['comments', taskId] as const,
  },
  labels: {
    byWorkspace: (workspaceId: string) => ['labels', workspaceId] as const,
  },
  activity: {
    byProject: (projectId: string) => ['activity', 'project', projectId] as const,
    byWorkspace: (workspaceId: string) => ['activity', 'workspace', workspaceId] as const,
  },
  search: {
    query: (workspaceId: string, q: string) => ['search', workspaceId, q] as const,
  },
  attachments: {
    byTask: (taskId: string) => ['attachments', taskId] as const,
  },
} as const
