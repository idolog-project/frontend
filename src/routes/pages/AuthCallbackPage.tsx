import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { useCompleteGoogleLogin } from '@/features/auth/useAuth'
import { useT } from '@/features/locale/useT'

/**
 * Where Google's round trip lands. The backend's callback sets the refresh
 * cookie and bounces here without an access token — deliberately, so no token
 * is ever written into a URL, browser history or a server log.
 *
 * So this screen has one job: spend that cookie for a session, then get out of
 * the way. It is never linked to; arriving here without a cookie just means the
 * sign-in did not complete, which is a trip back to the login screen.
 */
export function AuthCallbackPage() {
  const t = useT()
  const navigate = useNavigate()
  const complete = useCompleteGoogleLogin()

  const { mutate } = complete
  useEffect(() => {
    mutate(undefined, {
      onSuccess: () => navigate('/', { replace: true }),
    })
  }, [mutate, navigate])

  // `replace` throughout: the callback URL must not survive in history, or Back
  // would re-run an exchange whose one-time cookie is already spent.
  if (complete.isError) return <Navigate to="/login?error=oauth" replace />

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p role="status" className="text-body-md text-text-muted">
        {t('login.pending')}
      </p>
    </div>
  )
}
