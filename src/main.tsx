import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { QueryClientProvider } from '@tanstack/react-query'

import './index.css'
import { queryClient } from '@/app/queryClient'
import { router } from '@/routes/router'

async function bootstrap() {
  // The backend does not exist yet, so development runs entirely on MSW.
  if (import.meta.env.DEV) {
    const { startMockServiceWorker } = await import('@/mocks/browser')
    await startMockServiceWorker()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}

void bootstrap()
