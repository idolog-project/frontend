import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

import { cn } from '@/lib/cn'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: ReactNode
  error?: string
}

/**
 * Minimalist input with a hairline bottom border, per the system's component
 * rules. Label, hint and error are wired to the input by id so screen readers
 * announce them — the brief's accessibility baseline.
 */
export function Field({ label, hint, error, className, id, ...rest }: Props) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-caption text-text-subtle">
        {label}
      </label>

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          cn(hint ? hintId : null, error ? errorId : null) || undefined
        }
        className={cn(
          'border-b bg-transparent py-2 text-body-md text-text outline-none transition-colors',
          'placeholder:text-text-subtle',
          error ? 'border-danger' : 'border-border focus:border-primary',
          className,
        )}
        {...rest}
      />

      {hint && !error && (
        <span id={hintId} className="text-caption text-text-subtle">
          {hint}
        </span>
      )}

      {error && (
        <span
          id={errorId}
          className="flex items-center gap-1.5 text-caption text-danger"
        >
          <AlertCircle size={14} strokeWidth={1.5} aria-hidden />
          {error}
        </span>
      )}
    </div>
  )
}
