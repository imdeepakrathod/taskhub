import { useEffect, useState } from 'react'

import { useAuth } from '../../features/auth/hooks/useAuth'
import type { Project } from '../../features/projects/types'
import { SearchModal } from '../../features/search'
import { CreateWorkspaceModal, WorkspaceSettingsModal } from '../../features/workspaces'
import type { Workspace } from '../../features/workspaces/types'
import { NotificationBell } from '../../features/notifications'
import { ThemeToggle } from '../common/ThemeToggle'

export type AppView = 'projects' | 'team'

type AppLayoutProps = {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  activeView: AppView
  onSelectWorkspace: (workspaceId: string) => void
  onNavigate: (view: AppView) => void
  onSelectProject?: (project: Project) => void
  children: React.ReactNode
}

export function AppLayout({
  workspaces,
  activeWorkspace,
  activeView,
  onSelectWorkspace,
  onNavigate,
  onSelectProject,
  children,
}: AppLayoutProps) {
  const { user, logout } = useAuth()
  const [showCreateWs, setShowCreateWs] = useState(false)
  const [showWsMenu, setShowWsMenu] = useState(false)
  const [showWsSettings, setShowWsSettings] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Global Shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (activeWorkspace) {
          setShowSearch((prev) => !prev)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeWorkspace])

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* ── Left Sidebar ─────────────────────────────────────── */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col justify-between shrink-0 transition-colors">
        <div>
          {/* Logo / Brand */}
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-xs">
              T
            </div>
            <span className="font-bold tracking-tight text-gray-900 dark:text-gray-100 text-base">
              TaskHub
            </span>
          </div>

          {/* Workspace Switcher */}
          <div className="p-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowWsMenu(!showWsMenu)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/60 p-2.5 text-left hover:bg-gray-100/80 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                    Workspace
                  </div>
                  <div className="truncate font-semibold text-sm text-gray-800 dark:text-gray-200">
                    {activeWorkspace ? activeWorkspace.name : 'Select workspace'}
                  </div>
                </div>
                <span className="text-gray-400 dark:text-gray-500 text-xs">▼</span>
              </button>

              {/* Workspace Dropdown */}
              {showWsMenu && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1.5 shadow-lg">
                  <div className="max-h-56 overflow-y-auto space-y-0.5">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          onSelectWorkspace(ws.id)
                          setShowWsMenu(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition cursor-pointer ${
                          activeWorkspace?.id === ws.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-700 dark:text-indigo-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="truncate">{ws.name}</span>
                        {activeWorkspace?.id === ws.id && (
                          <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 pt-1.5 mt-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowWsMenu(false)
                        setShowCreateWs(true)
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                      <span>+</span>
                      <span>New workspace</span>
                    </button>

                    {activeWorkspace && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowWsMenu(false)
                          setShowWsSettings(true)
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                      >
                        <span>⚙</span>
                        <span>Workspace settings</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => onNavigate('projects')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 transition cursor-pointer ${
                activeView === 'projects'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <span>📁</span>
              <span>Projects</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('team')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 transition cursor-pointer ${
                activeView === 'team'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <span>👥</span>
              <span>Team</span>
            </button>
          </nav>
        </div>

        {/* User Info & Logout (Bottom) */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-3">
          <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition">
            <div className="min-w-0 pr-2">
              <div className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                {user?.name}
              </div>
              <div className="truncate text-[11px] text-gray-400 dark:text-gray-500">
                {user?.email}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              title="Log out"
              className="rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-8 transition-colors">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Workspaces</span>
            <span>/</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {activeWorkspace?.name ?? 'Dashboard'}
            </span>
            {activeView === 'team' && (
              <>
                <span>/</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Team</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeWorkspace && (
              <>
                <button
                  type="button"
                  onClick={() => setShowSearch(true)}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700 transition"
                >
                  <span className="flex items-center gap-1.5">
                    <span>🔍</span>
                    <span className="font-medium">Quick search...</span>
                  </span>
                  <kbd className="rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-300 shadow-2xs">
                    Ctrl K
                  </kbd>
                </button>

                <NotificationBell workspaceId={activeWorkspace.id} />
              </>
            )}

            {/* 🌗 Dark / Light Mode Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-6xl mx-auto">{children}</div>
      </main>

      {/* Modals */}
      <CreateWorkspaceModal
        isOpen={showCreateWs}
        onClose={() => setShowCreateWs(false)}
        onSuccess={(id) => onSelectWorkspace(id)}
      />

      {activeWorkspace && (
        <WorkspaceSettingsModal
          isOpen={showWsSettings}
          workspace={activeWorkspace}
          onClose={() => setShowWsSettings(false)}
          onDeleted={() => {
            const remaining = workspaces.filter((w) => w.id !== activeWorkspace.id)
            if (remaining.length > 0) {
              onSelectWorkspace(remaining[0].id)
            }
          }}
        />
      )}

      {activeWorkspace && onSelectProject && (
        <SearchModal
          isOpen={showSearch}
          workspaceId={activeWorkspace.id}
          onClose={() => setShowSearch(false)}
          onSelectProject={onSelectProject}
        />
      )}
    </div>
  )
}
