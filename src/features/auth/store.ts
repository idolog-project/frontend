import { create } from 'zustand'

import type { User } from '@/api/schemas'

/**
 * Global state is kept deliberately small (§2): only who is signed in. The
 * access token itself lives in `api/client`, never here and never in storage.
 */
type AuthState = {
  status: 'unknown' | 'authenticated' | 'anonymous'
  user: User | null
  signIn: (user: User) => void
  signOut: () => void
  setAnonymous: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'unknown',
  user: null,
  signIn: (user) => set({ status: 'authenticated', user }),
  signOut: () => set({ status: 'anonymous', user: null }),
  setAnonymous: () => set({ status: 'anonymous', user: null }),
}))
