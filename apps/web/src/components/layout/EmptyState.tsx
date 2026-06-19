import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Icon } from '../Icon'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  hint?: string
  className?: string
}

/**
 * Centered empty state — see docs/LAYOUT_SYSTEM.md#empty-states
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  hint,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={[
        'xp-card border-dashed p-8 text-center sm:p-10',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xp-full bg-surface-subtle">
        <Icon icon={icon} size={24} className="text-primary" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">
        {description}
      </p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
      {hint && <p className="mt-3 text-xs text-text-muted">{hint}</p>}
    </div>
  )
}
