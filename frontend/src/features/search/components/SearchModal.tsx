import { useEffect, useRef, useState } from 'react'

import type { Project } from '../../projects/types'
import { useSearch } from '../hooks/useSearch'
import type { SearchProjectResult, SearchTaskResult } from '../types'

type SearchModalProps = {
  isOpen: boolean
  workspaceId: string
  onClose: () => void
  onSelectProject: (project: Project) => void
  onSelectTask?: (task: SearchTaskResult) => void
}

const statusBadgeColors = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  IN_REVIEW: 'bg-purple-50 text-purple-700',
  DONE: 'bg-green-50 text-green-700',
  BACKLOG: 'bg-gray-50 text-gray-500',
}

export function SearchModal({ isOpen, workspaceId, onClose, onSelectProject }: SearchModalProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useSearch(workspaceId, input)

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)

      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setInput('')
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleClose = () => {
    setInput('')
    onClose()
  }

  const handleProjectClick = (proj: SearchProjectResult) => {
    onSelectProject({
      id: proj.id,
      name: proj.name,
      description: proj.description,
      workspaceId,
      createdById: '',
      createdAt: '',
      updatedAt: '',
    })
    handleClose()
  }

  const handleTaskClick = (task: SearchTaskResult) => {
    onSelectProject({
      id: task.projectId,
      name: task.project.name,
      description: null,
      workspaceId,
      createdById: '',
      createdAt: '',
      updatedAt: '',
    })
    handleClose()
  }

  const hasResults =
    (data?.tasks && data.tasks.length > 0) || (data?.projects && data.projects.length > 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search tasks, projects... (Type to search)"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          <kbd className="rounded border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-500 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {isLoading && <p className="p-4 text-xs text-gray-400 text-center">Searching...</p>}

          {!isLoading && input.trim() && !hasResults && (
            <p className="p-6 text-xs text-gray-400 text-center italic">
              No tasks or projects found matching "{input}"
            </p>
          )}

          {!input.trim() && (
            <div className="p-8 text-center text-xs text-gray-400">
              Type keywords to search across all tasks and projects in this workspace.
            </div>
          )}

          {/* Projects Results */}
          {data?.projects && data.projects.length > 0 && (
            <div className="mb-3">
              <span className="block px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Projects
              </span>
              <div className="space-y-1">
                {data.projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => handleProjectClick(proj)}
                    className="flex w-full items-center justify-between rounded-lg p-2.5 text-left hover:bg-gray-50 transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm">📁</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-indigo-600">
                          {proj.name}
                        </p>
                        {proj.description && (
                          <p className="text-[11px] text-gray-400 truncate">{proj.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">Open project →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Results */}
          {data?.tasks && data.tasks.length > 0 && (
            <div>
              <span className="block px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Tasks
              </span>
              <div className="space-y-1">
                {data.tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="flex w-full items-center justify-between rounded-lg p-2.5 text-left hover:bg-gray-50 transition group"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-medium text-gray-900 truncate group-hover:text-indigo-600">
                        {task.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        in <span className="font-semibold text-gray-600">{task.project.name}</span>
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                        statusBadgeColors[task.status]
                      }`}
                    >
                      {task.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
