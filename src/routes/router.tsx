import { Navigate, createBrowserRouter } from 'react-router'

import { AuthCallbackPage } from '@/routes/pages/AuthCallbackPage'
import { AppShell } from '@/components/layout/AppShell'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { LocaleGate } from '@/components/layout/LocaleGate'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { ToastProvider } from '@/components/ui/Toast'
import { CoursesPage } from '@/routes/pages/CoursesPage'
import { IdolLocationsPage } from '@/routes/pages/IdolLocationsPage'
import { LocationDetailPage } from '@/routes/pages/LocationDetailPage'
import { LoginPage } from '@/routes/pages/LoginPage'
import { MapHomePage } from '@/routes/pages/MapHomePage'
import { MyPage } from '@/routes/pages/MyPage'
import { NotFoundPage } from '@/routes/pages/NotFoundPage'
import { OnboardingPage } from '@/routes/pages/OnboardingPage'
import { SavedCourseDetailPage } from '@/routes/pages/SavedCourseDetailPage'
import { SavedCoursesPage } from '@/routes/pages/SavedCoursesPage'
import { TripPlanPage } from '@/routes/pages/TripPlanPage'

/**
 * Route table from the brief (§4) with three approved changes: `/` is the map
 * (draft structure), `/onboarding` exists (language pick, from the draft), and
 * signup folded into Google sign-in.
 */
export const router = createBrowserRouter([
  {
    // Toasts must outlive route changes; the boundary keeps a render crash
    // from unmounting to a black screen.
    element: (
      <ToastProvider>
        <ErrorBoundary>
          <LocaleGate />
        </ErrorBoundary>
      </ToastProvider>
    ),
    children: [
      { path: '/onboarding', element: <OnboardingPage /> },
      { path: '/login', element: <LoginPage /> },
      // Outside RequireAuth: the visitor is not signed in until this runs.
      { path: '/auth/callback', element: <AuthCallbackPage /> },
      // Google sign-in creates the account on first pass — no signup screen.
      { path: '/signup', element: <Navigate to="/login" replace /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <MapHomePage /> },
              { path: 'idols/:idolId', element: <IdolLocationsPage /> },
              { path: 'locations/:locationId', element: <LocationDetailPage /> },
              { path: 'locations/:locationId/plan', element: <TripPlanPage /> },
              { path: 'locations/:locationId/courses', element: <CoursesPage /> },
              { path: 'my', element: <MyPage /> },
              { path: 'my/courses', element: <SavedCoursesPage /> },
              { path: 'my/courses/:courseId', element: <SavedCourseDetailPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
])
