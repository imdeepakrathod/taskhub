import { useAuth } from '../features/auth/hooks/useAuth'

export function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <main>
      <h1>TaskHub Dashboard</h1>

      <p>
        Signed in as {user?.name} ({user?.email})
      </p>

      <button
        type="button"
        onClick={() => {
          void logout()
        }}
      >
        Log out
      </button>
    </main>
  )
}
