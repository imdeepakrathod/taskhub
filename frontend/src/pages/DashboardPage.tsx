import { useState } from 'react'

import { AppLayout } from '../components/layout/AppLayout'
import { ProjectList } from '../features/projects'
import { useWorkspaces } from '../features/workspaces'

export function DashboardPage() {
  const { data: workspaces = [], isLoading, isError } = useWorkspaces()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)

  const activeWorkspace =
    workspaces.find((w) => w.id === selectedWorkspaceId) ?? workspaces[0] ?? null

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm font-medium text-gray-500">Loading TaskHub...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
          Failed to load workspaces. Please refresh the page.
        </div>
      </div>
    )
  }

  return (
    <AppLayout
      workspaces={workspaces}
      activeWorkspace={activeWorkspace}
      onSelectWorkspace={(id) => setSelectedWorkspaceId(id)}
    >
      {activeWorkspace ? (
        <ProjectList workspaceId={activeWorkspace.id} workspaceName={activeWorkspace.name} />
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <h3 className="text-base font-semibold text-gray-900">No workspace selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create or select a workspace from the sidebar to view its projects.
          </p>
        </div>
      )}
    </AppLayout>
  )
}
