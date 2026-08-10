import { setupWorker } from 'msw/browser'

import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

/**
 * Started before React renders so no request escapes to a backend that does not
 * exist yet. Registered in development, and in a build only when
 * `VITE_ENABLE_MOCKS` asked for it — see `main.tsx`.
 *
 * `updateViaCache: 'none'` because the worker script is served by the same
 * static host as the app: without it a browser may hold a cached worker for up
 * to a day and keep answering from handlers that shipped in an older deploy.
 */
export async function startMockServiceWorker() {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
      options: { updateViaCache: 'none' },
    },
    // `quiet` in a build: the request log is a development aid, not something to
    // print into a deployed app's console.
    quiet: !import.meta.env.DEV,
  })
}
