import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { ToastContext, type ToastApi } from './toast-context'

type Toast = { id: number; message: string; tone: 'neutral' | 'danger' }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const push = useCallback((message: string, tone: Toast['tone']) => {
    const id = nextId.current
    nextId.current += 1
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(
      () => setToasts((current) => current.filter((t) => t.id !== id)),
      4000,
    )
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      show: (message) => push(message, 'neutral'),
      showError: (message) => push(message, 'danger'),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Announced politely so it never interrupts what the user is reading. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'rounded-full border px-5 py-2.5 text-body-sm backdrop-blur-md',
              toast.tone === 'danger'
                ? 'border-danger/40 bg-surface/90 text-danger'
                : 'border-border bg-surface/90 text-text',
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
