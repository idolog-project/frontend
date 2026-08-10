import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

/** Chips are 8px radius per the system — deliberately not the same as cards. */
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean
  icon?: ReactNode
}

export function Chip({ selected, icon, className, children, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded border px-4 py-1.5 text-caption transition-colors',
        selected
          ? 'border-accent bg-accent/15 text-primary'
          : 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

/** Non-interactive metadata pill — location, transport, best light, distance. */
export function InfoChip({
  icon,
  children,
}: {
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1.5 text-caption text-text-muted">
      {icon}
      {children}
    </span>
  )
}

/** Uppercase tracked micro-label used for section eyebrows and metadata. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="font-display text-label-caps uppercase text-text-subtle">
      {children}
    </span>
  )
}
