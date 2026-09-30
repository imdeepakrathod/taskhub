import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { useCreateProject } from '../hooks/useCreateProject'
import { useProjects } from '../hooks/useProjects'
import { createProjectSchema, type CreateProjectFormData } from '../schemas/projectSchemas'
import type { Project } from '../types'

type ProjectListProps = {
  workspaceId: string
  workspaceName: string
  onSelectProject?: (project: Project) => void
}

export function ProjectList({ workspaceId, workspaceName, onSelectProject }: ProjectListProps) {
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
      // Handled by query client
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{workspaceName} Projects</h2>
          <p className="text-sm text-gray-500">Select a project to open its Kanban board</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
        >
          + New Project
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading projects...</p>}
      {error && <p className="text-sm text-red-500">Failed to load projects.</p>}

      {!isLoading && projects.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-500">
            No projects yet. Create your first project to get started!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject?.(project)}
            className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-2xs hover:border-indigo-400 hover:shadow-md cursor-pointer transition"
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                <span className="text-xs text-indigo-600 font-medium">Open board →</span>
              </div>
              {project.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{project.description}</p>
              )}
            </div>
            <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Create New Project</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Project Name *
                </label>
                <input
                  {...register('name')}
                  placeholder="e.g. Website Redesign"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Optional brief description"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
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
