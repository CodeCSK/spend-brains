import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type AlertVariant = 'success' | 'error' | 'warning' | 'info'

const variantClass: Record<AlertVariant, string> = {
  success: 'xp-alert-success',
  error: 'xp-alert-error',
  warning: 'xp-alert-warning',
  info: 'rounded-xp-lg bg-info-bg px-3 py-2 text-sm text-info-text',
}

type AlertElement = 'p' | 'div'

type AlertProps = HTMLAttributes<HTMLElement> & {
  variant: AlertVariant
  /** When true, sets role="status" for live region announcements. */
  live?: boolean
  as?: AlertElement
  children: ReactNode
}

export function Alert({
  variant,
  live = false,
  as: Tag = 'p',
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <Tag
      role={live ? 'status' : undefined}
      className={cn(variantClass[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  )
}
