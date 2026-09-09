/**
 * Mock data is for the local Vite development server only.  Production must
 * always use the backend: a production mock could make Google login appear to
 * succeed without ever visiting Google.
 */
export const USE_MOCKS = import.meta.env.DEV

/**
 * Where the dev server forwards `/api` (see `vite.config.ts`). Set it and the
 * real backend answers whatever it has implemented, while MSW keeps standing in
 * for the rest — the catalogue and course endpoints do not exist there yet.
 *
 * Auth is the part that must not be mocked once a real backend is reachable: a
 * mock session would hand out a token that backend rejects, and the failure
 * would read as a backend bug rather than a mock in the way.
 *
 * Development only, like `USE_MOCKS` — production reaches the backend through
 * nginx, with no mock layer to stand down.
 */
export const HAS_REAL_API = Boolean(import.meta.env.VITE_API_PROXY_TARGET)
