/**
 * Mock data is for the local Vite development server only.  Production must
 * always use the backend: a production mock could make Google login appear to
 * succeed without ever visiting Google.
 */
export const USE_MOCKS = import.meta.env.DEV
