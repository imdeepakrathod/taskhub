import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { FullPageLoader } from '../../../components/FullPageLoader'

import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  const location = useLocation()

  if (isBootstrapping) {
    return <FullPageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
