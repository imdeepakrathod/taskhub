import { useState } from 'react'

import { AppLayout, type AppView } from '../components/layout/AppLayout'
import { useAuth } from '../features/auth/hooks/useAuth'
import { MembersList } from '../features/members'
import { ProjectList } from '../features/projects'
import type { Project } from '../features/projects/types'
import { KanbanBoard } from '../features/tasks'
import { useWorkspaces } from '../features/workspaces'

export function DashboardPage() {
  const { user } = useAuth()
  const { data: workspaces = [], isLoading, isError } = useWorkspaces()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeView, setActiveView] = useState<AppView>('projects')

  const activeWorkspace =
    workspaces.find((w) => w.id === selectedWorkspaceId) ?? workspaces[0] ?? null

  const handleSelectWorkspace = (id: string) => {
    setSelectedWorkspaceId(id)
    setSelectedProject(null)
  }

  const handleNavigate = (view: AppView) => {
    setActiveView(view)
    setSelectedProject(null) // Reset project when switching views
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

  const renderContent = () => {
    if (!activeWorkspace) {
      return (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <h3 className="text-base font-semibold text-gray-900">No workspace selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create or select a workspace from the sidebar to view its projects.
          </p>
        </div>
      )
    }

    if (activeView === 'team') {
      return (
        <MembersList
          workspaceId={activeWorkspace.id}
          currentUserRole={activeWorkspace.role}
          currentUserId={user?.id ?? ''}
        />
      )
    }

    if (selectedProject) {
      return (
        <KanbanBoard
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          onBack={() => setSelectedProject(null)}
        />
      )
    }

    return (
      <ProjectList
        workspaceId={activeWorkspace.id}
        workspaceName={activeWorkspace.name}
        onSelectProject={(project) => setSelectedProject(project)}
      />
    )
  }

  return (
    <AppLayout
      workspaces={workspaces}
      activeWorkspace={activeWorkspace}
      activeView={activeView}
      onSelectWorkspace={handleSelectWorkspace}
      onNavigate={handleNavigate}
    >
      {renderContent()}
    </AppLayout>
  )
}
