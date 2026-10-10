export const queryKeys = {
  workspaces: {
    all: ['workspaces'] as const,
  },
  projects: {
    all: ['projects'] as const,
    byWorkspace: (workspaceId: string) => ['projects', workspaceId] as const,
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
} as const
