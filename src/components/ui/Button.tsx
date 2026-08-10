import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { buttonClasses, type ButtonVariant } from './button-styles'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  fullWidth?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'ghost',
  fullWidth,
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, fullWidth, className)}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
