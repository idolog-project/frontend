import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ApiError, refreshSession, setAccessToken } from '@/api/client'
import * as api from '@/api/endpoints'
import { useAuthStore } from './store'

/**
 * Resolves who is signed in once, on boot. A 401 here is the expected answer
 * for a visitor, not an error worth surfacing.
 */
export function useRestoreSession() {
  const { status, signIn, setAnonymous } = useAuthStore()

  useEffect(() => {
    if (status !== 'unknown') return
    let cancelled = false

    api
      .getMe()
      .then((user) => {
        if (!cancelled) signIn(user)
      })
      .catch(() => {
        if (!cancelled) setAnonymous()
      })

    return () => {
      cancelled = true
    }
  }, [status, signIn, setAnonymous])

  return status
}

/**
 * Finishes the Google round trip. The callback route is reached with only the
 * refresh cookie set — deliberately, so no access token is ever exposed in a
 * URL — so the session is claimed by spending that cookie for a token.
 *
 * The whole app reloaded on the way back from Google, which is why this cannot
 * live in the login screen's state.
 */
export function useCompleteGoogleLogin() {
  const { signIn, setAnonymous } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      const claimed = await refreshSession()
      if (!claimed) {
        throw new ApiError(401, 'UNAUTHENTICATED', 'oauth callback carried no session')
      }
      return api.getMe()
    },
    onSuccess: signIn,
    onError: () => {
      setAccessToken(null)
      setAnonymous()
    },
  })
}

export function useLogout() {
  const signOut = useAuthStore((s) => s.signOut)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.logout(),
    onSettled: () => {
      setAccessToken(null)
      signOut()
      queryClient.clear()
    },
  })
}

/** Turns an unknown thrown value into copy the user can act on (§9). */
export function messageFor(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}
