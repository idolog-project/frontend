import { setupWorker } from 'msw/browser'

import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

/** Started before React renders so no request escapes to a backend that does
 *  not exist yet. Dev only — the worker is never registered in a build. */
export async function startMockServiceWorker() {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
}
