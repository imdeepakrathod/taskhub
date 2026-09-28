import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useCreateProject } from '../hooks/useCreateProject'
import { useProjects } from '../hooks/useProjects'
import { createProjectSchema, type CreateProjectFormData } from '../schemas/projectSchemas'

type ProjectListProps = {
  workspaceId: string
  workspaceName: string
}

export function ProjectList({ workspaceId, workspaceName }: ProjectListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: projects = [], isLoading, error } = useProjects(workspaceId)
  const { mutateAsync: createProjectMutation, isPending } = useCreateProject(workspaceId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', description: '' },
  })

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      await createProjectMutation(data)
      reset()
      setShowCreateModal(false)
    } catch {
      // Handled by query client / axios error toast
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{workspaceName} Projects</h2>
          <p className="text-sm text-gray-500">Manage and track projects in this workspace</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          + New Project
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading projects...</p>}
      {error && <p className="text-sm text-red-500">Failed to load projects.</p>}

      {!isLoading && projects.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">
            No projects yet. Create your first project to get started!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-300 transition"
          >
            <div>
              <h3 className="font-semibold text-gray-900">{project.name}</h3>
              {project.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{project.description}</p>
              )}
            </div>
            <div className="mt-4 border-t pt-3 text-xs text-gray-400">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Create New Project</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Name *</label>
                <input
                  {...register('name')}
                  placeholder="e.g. Website Redesign"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Optional brief description"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
