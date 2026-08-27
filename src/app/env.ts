/**
 * The backend does not exist yet, so development runs entirely on MSW — and so
 * does the deployed preview, which is what `VITE_ENABLE_MOCKS` is for. Without
 * it a build has no mock layer and every `/api` call falls through to whatever
 * serves the static files, which answers a POST with 405 rather than JSON.
 *
 * Both operands are compile-time constants, so a build with the flag off drops
 * every branch that tests this and the mock data never reaches the bundle.
 * Turn the flag off the day the real API is up.
 */
export const USE_MOCKS =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === 'true'
