import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { createTaskSchema, type CreateTaskFormData } from '../schemas/taskSchemas'
import type { TaskStatus } from '../types'

type CreateTaskModalProps = {
  isOpen: boolean
  defaultStatus?: TaskStatus
  onClose: () => void
  onSubmitTask: (data: CreateTaskFormData) => Promise<void>
}

export function CreateTaskModal({
  isOpen,
  defaultStatus = 'TODO',
  onClose,
  onSubmitTask,
}: CreateTaskModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: defaultStatus,
      priority: 'MEDIUM',
    },
  })

  if (!isOpen) return null

  const onSubmit = async (data: CreateTaskFormData) => {
    await onSubmitTask(data)
    reset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Create Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
              Title *
            </label>
            <input
              {...register('title')}
              placeholder="e.g. Design user authentication flow"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Add details, acceptance criteria..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Priority
              </label>
              <select
                {...register('priority')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Status
              </label>
              <select
                {...register('status')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
