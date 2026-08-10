import { Navigate, Outlet, useLocation } from 'react-router'

import { hasChosenLocaleThisVisit } from '@/features/locale/store'

/**
 * Every visit opens on the language screen before anything else — the app ships
 * in three languages and must not guess on screen one. The flag it reads lives
 * only in memory, so picking a language releases the gate for the rest of the
 * visit and a reload brings the screen back.
 */
export function LocaleGate() {
  const location = useLocation()
  if (!hasChosenLocaleThisVisit() && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}
