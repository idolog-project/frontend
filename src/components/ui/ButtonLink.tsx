import { Link, type LinkProps } from 'react-router'
import type { ReactNode } from 'react'

import { buttonClasses, type ButtonVariant } from './button-styles'

type Props = LinkProps & {
  variant?: ButtonVariant
  fullWidth?: boolean
  icon?: ReactNode
}

/**
 * A navigation that looks like a button. Wrapping a <Link> inside a <button>
 * nests two interactive elements, which is invalid HTML and leaves only the
 * inner text clickable — use this instead.
 */
export function ButtonLink({
  variant = 'ghost',
  fullWidth,
  icon,
  className,
  children,
  ...rest
}: Props) {
  return (
    <Link className={buttonClasses(variant, fullWidth, className)} {...rest}>
      {icon}
      {children}
    </Link>
  )
}
