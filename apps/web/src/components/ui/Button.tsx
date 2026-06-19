import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'xp-btn-primary',
  secondary: 'xp-btn-secondary',
  ghost: 'xp-btn-ghost',
  destructive: 'xp-btn-ghost text-error-text-strong hover:bg-error-bg',
}

type ButtonBaseProps = {
  variant?: ButtonVariant
  loading?: boolean
  className?: string
  children: ReactNode
}

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    as?: 'button'
    to?: never
  }

type ButtonAsLink = ButtonBaseProps &
  Omit<LinkProps, 'to' | 'children' | 'className'> & {
    as: 'link'
    to: string
    type?: never
    disabled?: boolean
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink

export function Button({
  variant = 'primary',
  loading = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(variantClass[variant], className)
  const isDisabled = loading || ('disabled' in props && props.disabled)

  if (props.as === 'link') {
    const { as: _as, to, disabled: _disabled, ...linkProps } = props

    if (isDisabled) {
      return (
        <span className={classes} aria-disabled="true">
          {children}
        </span>
      )
    }

    return (
      <Link to={to} className={classes} {...linkProps}>
        {children}
      </Link>
    )
  }

  const { as: _as, type = 'button', disabled: _disabled, ...buttonProps } = props

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={classes}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
