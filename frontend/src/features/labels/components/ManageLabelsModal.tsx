import { useState } from 'react'

import { useLabelMutations } from '../hooks/useLabelMutations'
import { useLabels } from '../hooks/useLabels'
import { LabelBadge } from './LabelBadge'

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
]

type ManageLabelsModalProps = {
  isOpen: boolean
  workspaceId: string
  onClose: () => void
}

export function ManageLabelsModal({ isOpen, workspaceId, onClose }: ManageLabelsModalProps) {
  const { data: labels = [], isLoading } = useLabels(workspaceId)
  const { createLabel, isCreating, deleteLabel } = useLabelMutations(workspaceId)

  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmed = name.trim()

    if (!trimmed) return

    try {
      await createLabel({ name: trimmed, color })
      setName('')
    } catch {
      setError('Label already exists or could not be created')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Manage Workspace Labels</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Existing Labels List */}
        <div className="py-4 border-b border-gray-100">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
            Active Labels ({labels.length})
          </h4>

          {isLoading && <p className="text-xs text-gray-400">Loading labels...</p>}

          {!isLoading && labels.length === 0 && (
            <p className="text-xs text-gray-400 italic">No labels created yet.</p>
          )}

          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {labels.map((label) => (
              <LabelBadge
                key={label.id}
                name={label.name}
                color={label.color}
                onRemove={() => void deleteLabel(label.id)}
              />
            ))}
          </div>
        </div>

        {/* Create Label Form */}
        <form onSubmit={handleCreate} className="pt-4 space-y-3.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Create New Label
          </h4>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Label Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bug, Feature, Urgent"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Color</label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full border-2 transition ${
                    color === c
                      ? 'border-gray-900 scale-110 shadow-xs'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isCreating ? 'Creating...' : '+ Add Label'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
