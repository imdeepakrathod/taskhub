export const queryKeys = {
  workspaces: {
    all: ['workspaces'] as const,
  },
  projects: {
    all: ['projects'] as const,
    byWorkspace: (workspaceId: string) => ['projects', workspaceId] as const,
  },
} as const
