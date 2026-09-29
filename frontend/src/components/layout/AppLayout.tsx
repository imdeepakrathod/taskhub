import { useState } from 'react'

import { useAuth } from '../../features/auth/hooks/useAuth'
import { CreateWorkspaceModal } from '../../features/workspaces'
import type { Workspace } from '../../features/workspaces/types'

type AppLayoutProps = {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  onSelectWorkspace: (workspaceId: string) => void
  children: React.ReactNode
}

export function AppLayout({
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  children,
}: AppLayoutProps) {
  const { user, logout } = useAuth()
  const [showCreateWs, setShowCreateWs] = useState(false)
  const [showWsMenu, setShowWsMenu] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* ── Left Sidebar ─────────────────────────────────────── */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Brand */}
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-xs">
              T
            </div>
            <span className="font-bold tracking-tight text-gray-900 text-base">TaskHub</span>
          </div>

          {/* Workspace Switcher */}
          <div className="p-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowWsMenu(!showWsMenu)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50/70 p-2.5 text-left hover:bg-gray-100/80 transition"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    Workspace
                  </div>
                  <div className="truncate font-semibold text-sm text-gray-800">
                    {activeWorkspace ? activeWorkspace.name : 'Select workspace'}
                  </div>
                </div>
                <span className="text-gray-400 text-xs">▼</span>
              </button>

              {/* Workspace Dropdown */}
              {showWsMenu && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
                  <div className="max-h-56 overflow-y-auto space-y-0.5">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          onSelectWorkspace(ws.id)
                          setShowWsMenu(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs ${
                          activeWorkspace?.id === ws.id
                            ? 'bg-indigo-50 font-semibold text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="truncate">{ws.name}</span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 uppercase">
                          {ws.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-1.5 border-t border-gray-100 pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowWsMenu(false)
                        setShowCreateWs(true)
                      }}
                      className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                    >
                      <span>+</span> Create new workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1 text-sm font-medium">
            <a
              href="#projects"
              className="flex items-center gap-2.5 rounded-lg bg-indigo-50 px-3 py-2 text-indigo-700 font-semibold"
            >
              <span>📁</span>
              <span>Projects</span>
            </a>
            <button
              type="button"
              onClick={() => setShowCreateWs(true)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
            >
              <span>➕</span>
              <span>Add Workspace</span>
            </button>
          </nav>
        </div>

        {/* User Info & Logout (Bottom) */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50">
            <div className="min-w-0 pr-2">
              <div className="truncate text-xs font-semibold text-gray-800">{user?.name}</div>
              <div className="truncate text-[11px] text-gray-400">{user?.email}</div>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              title="Log out"
              className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Workspaces</span>
            <span>/</span>
            <span className="font-semibold text-gray-900">
              {activeWorkspace?.name ?? 'Dashboard'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-6xl mx-auto">{children}</div>
      </main>

      {/* Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateWs}
        onClose={() => setShowCreateWs(false)}
        onSuccess={(id) => onSelectWorkspace(id)}
      />
    </div>
  )
}
