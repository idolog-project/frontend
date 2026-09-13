import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { startGoogleLogin } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Chip'
import { useT } from '@/features/locale/useT'
import { randomBackdrop } from '@/mocks/images'
import { AuthLayout } from './AuthLayout'

/** Google's mark, inlined so no external request is needed to render it. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}

export function LoginPage() {
  const t = useT()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // Sign-in leaves the page for Google, so there is no request to track — only
  // the moment between the click and the browser giving up this document.
  const [leaving, setLeaving] = useState(false)
  /**
   * A different frame each time this screen is reached.
   *
   * Held in state so it survives the re-render that `leaving` causes — picking
   * while rendering would swap the photograph at the moment the button is
   * pressed, which is the one moment nothing should move.
   */
  const [backdrop] = useState(randomBackdrop)

  // Set by the callback route when the round trip came back without a session.
  const failed = params.get('error') === 'oauth'

  // Always land on the map after signing in. The brief (§4) asked for a return
  // to the interrupted path; that was overridden by a later decision — every
  // session starts from the map.

  return (
    <AuthLayout imageUrl={backdrop}>
      <div className="flex flex-col gap-3">
        <Eyebrow>{t('login.eyebrow')}</Eyebrow>
        <h1 className="font-display text-display-md text-balance">
          {t('login.headline')}
        </h1>
        <p className="text-body-md text-text-muted">{t('login.lede')}</p>
      </div>

      <div className="flex flex-col gap-4">
        <Button
          variant="primary"
          fullWidth
          disabled={leaving}
          icon={leaving ? undefined : <GoogleMark />}
          onClick={() => {
            setLeaving(true)
            void startGoogleLogin(() =>
              navigate('/auth/callback', { replace: true }),
            ).catch(() => setLeaving(false))
          }}
        >
          {leaving ? t('login.pending') : t('login.google')}
        </Button>

        {failed && (
          <p role="alert" className="text-body-sm text-danger">
            {t('login.failed')}
          </p>
        )}
      </div>
    </AuthLayout>
  )
}
