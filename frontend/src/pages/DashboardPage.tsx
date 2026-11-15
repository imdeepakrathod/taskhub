import { useState } from 'react'

import { AppLayout, type AppView } from '../components/layout/AppLayout'
import { useAuth } from '../features/auth/hooks/useAuth'
import { MembersList } from '../features/members'
import { CreateProjectModal, ProjectList } from '../features/projects'
import { useProjects } from '../features/projects/hooks/useProjects'
import type { Project } from '../features/projects/types'
import { KanbanBoard } from '../features/tasks'
import { MyTasksView } from '../features/tasks/components/MyTasksView'
import { useWorkspaces } from '../features/workspaces'

export function DashboardPage() {
  const { user } = useAuth()
  const { data: workspaces = [], isLoading, isError } = useWorkspaces()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeView, setActiveView] = useState<AppView>('projects')
  const [showCreateProject, setShowCreateProject] = useState(false)

  // Declare activeWorkspace FIRST so hooks receive correct workspaceId
  const activeWorkspace =
    workspaces.find((w) => w.id === selectedWorkspaceId) ?? workspaces[0] ?? null

  const { data: projects = [] } = useProjects(activeWorkspace?.id ?? '')

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading TaskHub...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-6 text-center text-sm text-red-600 dark:text-red-400">
          Failed to load workspaces. Please refresh the page.
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (!activeWorkspace) {
      return (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-12 text-center">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            No workspace selected
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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

    // 🎯 My Tasks View
    if (activeView === 'my-tasks') {
      return (
        <MyTasksView
          workspaceId={activeWorkspace.id}
          onSelectTask={(task) => {
            const project =
              projects.find((p) => p.id === task.projectId) ??
              ({ id: task.projectId, name: 'Project' } as Project)
            setSelectedProject(project)
            setActiveView('projects')
          }}
        />
      )
    }

    if (selectedProject) {
      return (
        <KanbanBoard
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          workspaceId={activeWorkspace.id}
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
    <>
      <AppLayout
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        activeView={activeView}
        projects={projects}
        activeProject={selectedProject}
        onSelectWorkspace={handleSelectWorkspace}
        onNavigate={handleNavigate}
        onSelectProject={(project) => {
          setSelectedProject(project)
          setActiveView('projects')
        }}
        onOpenCreateProject={() => setShowCreateProject(true)}
      >
        {renderContent()}
      </AppLayout>

      {/* Global Quick Create Project Modal (triggered from sidebar '+') */}
      {activeWorkspace && (
        <CreateProjectModal
          isOpen={showCreateProject}
          workspaceId={activeWorkspace.id}
          onClose={() => setShowCreateProject(false)}
        />
      )}
    </>
  )
}
