import { Navigate, Outlet, useLocation } from 'react-router'

import { useRestoreSession } from '@/features/auth/useAuth'
import { Skeleton } from '@/components/ui/states'

/**
 * Everything except the auth screens sits behind this. An unauthenticated visit
 * is redirected to /login carrying the path it came from, so signing in returns
 * them to where they were headed (§4).
 */
export function RequireAuth() {
  const status = useRestoreSession()
  const location = useLocation()

  if (status === 'unknown') {
    return (
      <div className="flex flex-col gap-4 px-screen py-16">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
    )
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
