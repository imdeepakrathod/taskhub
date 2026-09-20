import { Navigate, Outlet } from 'react-router-dom'

import { FullPageLoader } from '../../../components/FullPageLoader'

import { useAuth } from '../hooks/useAuth'

export function GuestRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return <FullPageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
