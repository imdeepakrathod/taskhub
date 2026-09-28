import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { getAuthErrorMessage } from '../../auth/api/getAuthErrorMessage'
import { useCreateWorkspace } from '../hooks/useCreateWorkspace'
import { createWorkspaceSchema, type CreateWorkspaceFormValues } from '../schemas/workspaceSchemas'

type CreateWorkspaceModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (workspaceId: string) => void
}

export function CreateWorkspaceModal({ isOpen, onClose, onSuccess }: CreateWorkspaceModalProps) {
  const createWorkspaceMutation = useCreateWorkspace()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: '' },
  })

  if (!isOpen) return null

  const onSubmit = async (values: CreateWorkspaceFormValues) => {
    try {
      const created = await createWorkspaceMutation.mutateAsync(values)
      reset()
      onSuccess(created.id)
      onClose()
    } catch {
      // Handled by mutation error
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Create new workspace</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          {createWorkspaceMutation.error && (
            <div className="rounded-md bg-red-50 p-3 text-xs text-red-600">
              {getAuthErrorMessage(createWorkspaceMutation.error)}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
              Workspace Name
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Acme Corp, Engineering"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createWorkspaceMutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {createWorkspaceMutation.isPending ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
