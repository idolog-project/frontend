import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ApiError, setAccessToken } from '@/api/client'
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
 * The only sign-in route in the UI. Signing up and signing in are the same
 * action with Google — a first-time account is created on the way through.
 */
export function useGoogleLogin() {
  const signIn = useAuthStore((s) => s.signIn)

  return useMutation({
    mutationFn: async () => {
      const { accessToken } = await api.googleLogin()
      setAccessToken(accessToken)
      return api.getMe()
    },
    onSuccess: signIn,
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
