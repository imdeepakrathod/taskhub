import { useState } from 'react'

import { AppLayout } from '../components/layout/AppLayout'
import { ProjectList, type Project } from '../features/projects'
import { KanbanBoard } from '../features/tasks'
import { useWorkspaces } from '../features/workspaces'

export function DashboardPage() {
  const { data: workspaces = [], isLoading, isError } = useWorkspaces()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const activeWorkspace =
    workspaces.find((w) => w.id === selectedWorkspaceId) ?? workspaces[0] ?? null

  const handleSelectWorkspace = (id: string) => {
    setSelectedWorkspaceId(id)
    setSelectedProject(null) // Reset project when switching workspaces
  }

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
      onSelectWorkspace={handleSelectWorkspace}
    >
      {selectedProject ? (
        <KanbanBoard
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          onBack={() => setSelectedProject(null)}
        />
      ) : activeWorkspace ? (
        <ProjectList
          workspaceId={activeWorkspace.id}
          workspaceName={activeWorkspace.name}
          onSelectProject={(project) => setSelectedProject(project)}
        />
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
