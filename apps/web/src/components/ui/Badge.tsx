import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import type { MemberRole } from '../../types/event'

export type BadgeVariant = 'neutral' | 'success' | 'info' | 'warning' | 'role'

const variantClass: Record<Exclude<BadgeVariant, 'role'>, string> = {
  neutral: 'border border-border bg-surface-subtle text-text-secondary',
  success: 'bg-success-bg text-success-text',
  info: 'bg-info-bg text-info-text',
  warning: 'bg-warning-bg text-warning-text',
}

function roleBadgeClass(role: MemberRole): string {
  if (role === 'captain') {
    return 'bg-primary text-primary-fg'
  }
  if (role === 'vice_captain') {
    return 'bg-secondary text-secondary-fg'
  }
  return 'bg-surface-subtle text-text-secondary'
}

type BadgeBaseProps = {
  className?: string
  children: ReactNode
}

type BadgeRoleProps = BadgeBaseProps & {
  variant: 'role'
  role: MemberRole
}

type BadgeStandardProps = BadgeBaseProps & {
  variant?: Exclude<BadgeVariant, 'role'>
  role?: never
}

export type BadgeProps = BadgeRoleProps | BadgeStandardProps

export function Badge(props: BadgeProps) {
  const { className, children } = props

  const colorClass =
    props.variant === 'role'
      ? roleBadgeClass(props.role)
      : variantClass[props.variant ?? 'neutral']

  return (
    <span
      className={cn(
        'shrink-0 rounded-xp-md px-2 py-0.5 text-xs font-medium',
        colorClass,
        className,
      )}
    >
      {children}
    </span>
  )
}
