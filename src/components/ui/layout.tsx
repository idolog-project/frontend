import { useId, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'
import { Eyebrow } from './Chip'

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-3">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="font-display text-display-md text-balance">{title}</h1>
      {children}
    </header>
  )
}

/** Section title with the hairline rule the system uses instead of shadows. */
export function SectionHeader({
  title,
  meta,
  rule,
}: {
  title: string
  meta?: ReactNode
  rule?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-end justify-between gap-4',
        rule && 'border-b border-border pb-2',
      )}
    >
      <h2 className="font-display text-title-md">{title}</h2>
      {meta && <span className="text-caption text-text-subtle">{meta}</span>}
    </div>
  )
}

/** "더 자세히 설정" — optional inputs stay folded so the required path is short. */
export function Disclosure({
  summary,
  hint,
  children,
}: {
  summary: string
  hint?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="border-y border-border">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-primary"
      >
        <span className="flex flex-col gap-1">
          <span className="text-body-md">{summary}</span>
          {hint && <span className="text-caption text-text-subtle">{hint}</span>}
        </span>
        <ChevronDown
          size={20}
          strokeWidth={1.5}
          aria-hidden
          className={cn('shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div id={panelId} className="flex flex-col gap-6 pb-6">
          {children}
        </div>
      )}
    </div>
  )
}

/** Slim two-step indicator for the trip conditions flow. */
export function StepIndicator({ current, total }: { current: number; total: number }) {
  const t = useT()

  // No aria-label here: it would sit on a plain div, which exposes no accessible
  // name, and it would only repeat the visible text below anyway.
  return (
    <div className="flex items-center gap-3">
      <Eyebrow>{t('plan.step')}</Eyebrow>
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-0.5 w-8 rounded-full',
              i < current ? 'bg-accent' : 'bg-border',
            )}
          />
        ))}
      </div>
      <span className="text-caption tabular-nums text-text-subtle">
        <span className="sr-only">{t('plan.stepAria', { current, total })}</span>
        <span aria-hidden>
          {current}/{total}
        </span>
      </span>
    </div>
  )
}

/** Glass bar pinned to the bottom of a content column. */
export function StickyBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-screen border-t border-border bg-background/85 px-screen py-4 backdrop-blur-md">
      {/* The action must never shrink or wrap inside its pill — callers put the
          flexible content first and the button last. */}
      <div className="flex items-center justify-between gap-4 [&>:last-child]:shrink-0 [&>:last-child]:whitespace-nowrap">
        {children}
      </div>
    </div>
  )
}
