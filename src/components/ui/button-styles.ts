import { cn } from '@/lib/cn'

/**
 * The design system allows exactly one gradient button per screen (`primary`);
 * everything else is an outline, a neutral ghost, or a text link. Keeping the
 * variants this narrow is what stops the "sea of filled buttons" it forbids.
 */
export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'text'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-accent to-accent-end text-[#2a0009] font-semibold hover:opacity-90',
  outline: 'border border-primary text-primary hover:bg-primary/10',
  ghost: 'border border-border text-text hover:bg-surface hover:border-border-strong',
  text: 'text-primary hover:text-text underline-offset-4 hover:underline',
}

export function buttonClasses(
  variant: ButtonVariant,
  fullWidth?: boolean,
  className?: string,
) {
  return cn(
    'inline-flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    variant === 'text' ? 'text-body-sm' : 'rounded-full px-6 py-3 text-body-sm',
    VARIANTS[variant],
    fullWidth && 'w-full',
    className,
  )
}
