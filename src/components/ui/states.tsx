import type { ReactNode } from 'react'
import { CircleSlash, RotateCw, SearchX } from 'lucide-react'

import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'
import { Button } from './Button'
import { Eyebrow } from './Chip'

/** Neutral shimmer block. Sized by the caller so it matches the real content. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded bg-surface-raised', className)}
    />
  )
}

/**
 * Empty and error states both point at a next action rather than apologising —
 * the brief is explicit about this (§9).
 */
export function EmptyState({
  title,
  body,
  action,
  icon = <CircleSlash size={28} strokeWidth={1.5} aria-hidden />,
}: {
  title: string
  body?: ReactNode
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex max-w-prose flex-col items-start gap-3 py-16 text-text-subtle">
      {icon}
      <h2 className="font-display text-title-md text-text">{title}</h2>
      {body && <p className="text-body-md text-text-muted">{body}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}

export function ErrorState({
  title,
  body,
  onRetry,
  retryLabel,
  secondaryAction,
}: {
  title: string
  body?: ReactNode
  onRetry?: () => void
  retryLabel?: string
  secondaryAction?: ReactNode
}) {
  const t = useT()

  return (
    <div className="flex max-w-prose flex-col items-start gap-3 py-16">
      <Eyebrow>{t('state.errorEyebrow')}</Eyebrow>
      <h2 className="font-display text-title-md text-text">{title}</h2>
      {body && <p className="text-body-md text-text-muted">{body}</p>}
      <div className="flex flex-wrap gap-3 pt-2">
        {onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            icon={<RotateCw size={16} strokeWidth={1.5} aria-hidden />}
          >
            {retryLabel ?? t('state.retry')}
          </Button>
        )}
        {secondaryAction}
      </div>
    </div>
  )
}

export function NoResults({
  title,
  body,
  action,
}: {
  title: string
  body?: ReactNode
  action?: ReactNode
}) {
  return (
    <EmptyState
      icon={<SearchX size={28} strokeWidth={1.5} aria-hidden />}
      title={title}
      body={body}
      action={action}
    />
  )
}
