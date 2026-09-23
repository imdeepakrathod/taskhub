import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { getAuthErrorMessage } from '../features/auth/api/getAuthErrorMessage'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useCreateWorkspace, useWorkspaces } from '../features/workspaces'
import {
  createWorkspaceSchema,
  type CreateWorkspaceFormValues,
} from '../features/workspaces/schemas/workspaceSchemas'

import './DashboardPage.css'

export function DashboardPage() {
  const { user, logout } = useAuth()

  const { data: workspaces, isLoading, isError } = useWorkspaces()
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

  const handleCreateWorkspace = handleSubmit(async (values) => {
    try {
      await createWorkspaceMutation.mutateAsync(values)
      reset()
    } catch {
      // Mutation state renders the API error below.
    }
  })

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-topbar">
          <div>
            <h1>TaskHub Dashboard</h1>
            <p>
              Signed in as {user?.name} ({user?.email})
            </p>
          </div>

          <button
            type="button"
            className="dashboard-logout"
            onClick={() => {
              void logout()
            }}
          >
            Log out
          </button>
        </header>

        <section className="dashboard-card">
          <h2>Your workspaces</h2>

          {isLoading ? <p className="dashboard-loading">Loading workspaces...</p> : null}

          {isError ? (
            <div className="dashboard-alert" role="alert">
              Could not load workspaces. Try again.
            </div>
          ) : null}

          {!isLoading && !isError && workspaces?.length === 0 ? (
            <p className="dashboard-empty">
              You don&apos;t belong to any workspace yet. Create one below.
            </p>
          ) : null}

          {workspaces && workspaces.length > 0 ? (
            <ul className="workspace-list">
              {workspaces.map((workspace) => (
                <li key={workspace.id} className="workspace-item">
                  <span className="workspace-item__name">{workspace.name}</span>
                  <span className="workspace-item__role">{workspace.role.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="dashboard-card">
          <h2>Create a workspace</h2>

          <form className="dashboard-form" onSubmit={handleCreateWorkspace} noValidate>
            {createWorkspaceMutation.error ? (
              <div className="dashboard-alert" role="alert">
                {getAuthErrorMessage(createWorkspaceMutation.error)}
              </div>
            ) : null}

            <div className="dashboard-field">
              <label htmlFor="workspace-name">Workspace name</label>

              <input
                id="workspace-name"
                type="text"
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'workspace-name-error' : undefined}
                {...register('name')}
              />

              {errors.name ? (
                <p id="workspace-name-error" className="dashboard-field__error">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              className="dashboard-submit"
              disabled={createWorkspaceMutation.isPending}
            >
              {createWorkspaceMutation.isPending ? 'Creating...' : 'Create workspace'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
