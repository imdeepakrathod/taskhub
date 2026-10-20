import { useState } from 'react'

import { useWorkspaceMutations } from '../hooks/useWorkspaceMutations'
import type { Workspace } from '../types'

type WorkspaceSettingsModalProps = {
  isOpen: boolean
  workspace: Workspace
  onClose: () => void
  onDeleted: () => void
}

export function WorkspaceSettingsModal({
  isOpen,
  workspace,
  onClose,
  onDeleted,
}: WorkspaceSettingsModalProps) {
  const { updateWorkspace, isUpdating, deleteWorkspace, isDeleting } = useWorkspaceMutations()

  const [name, setName] = useState(workspace.name)
  const [confirmNameInput, setConfirmNameInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isOwner = workspace.role === 'OWNER'

  if (!isOpen) return null

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmed = name.trim()

    if (!trimmed) return

    try {
      await updateWorkspace({ workspaceId: workspace.id, name: trimmed })
      onClose()
    } catch {
      setError('Failed to update workspace.')
    }
  }

  const handleDelete = async () => {
    if (confirmNameInput !== workspace.name) return

    try {
      await deleteWorkspace(workspace.id)
      onClose()
      onDeleted()
    } catch {
      setError('Failed to delete workspace.')
    }
  }

  const isDeleteConfirmed = confirmNameInput === workspace.name

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-gray-100 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Workspace Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Workspace Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdating || !name.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Danger Zone - OWNER only */}
        {isOwner ? (
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-3">
            <h4 className="text-sm font-bold text-red-800">Danger Zone</h4>
            <p className="text-xs text-red-700 leading-relaxed">
              Deleting this workspace will permanently erase all projects, tasks, labels, and member
              memberships.
            </p>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-medium text-gray-700">
                To confirm, type <span className="font-bold text-red-700">{workspace.name}</span>{' '}
                below:
              </label>
              <input
                type="text"
                value={confirmNameInput}
                onChange={(e) => setConfirmNameInput(e.target.value)}
                placeholder={workspace.name}
                className="w-full rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={!isDeleteConfirmed || isDeleting}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40 transition"
            >
              {isDeleting ? 'Deleting workspace...' : 'Delete this workspace'}
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">
            Only the workspace owner can delete this workspace.
          </p>
        )}
      </div>
    </div>
  )
}
