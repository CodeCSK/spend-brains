import type { ReactNode } from 'react'

import { Icon } from '../../../components/Icon'
import type { EventType } from '../../../types/event'
import { getEventTypeTheme } from '../lib/event-type-theme'
import { cn } from '../../../lib/cn'

type EventTypeBannerProps = {
  eventType: EventType
  /** compact: event header · card: events grid thumbnail */
  variant?: 'compact' | 'card'
  archived?: boolean
  className?: string
  children?: ReactNode
}

export function EventTypeBanner({
  eventType,
  variant = 'compact',
  archived = false,
  className,
  children,
}: EventTypeBannerProps) {
  const theme = getEventTypeTheme(eventType)
  const heightClass = variant === 'card' ? 'h-28' : 'h-20'

  return (
    <div
      className={cn('relative overflow-hidden', heightClass, className)}
      style={{ background: theme.gradient }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20"
        style={{ background: theme.iconBg }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 left-1/3 h-20 w-20 rounded-full opacity-10"
        style={{ background: theme.iconBg }}
      />

      <div className="relative flex h-full items-center gap-3 px-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xp-lg"
          style={{ backgroundColor: theme.iconBg, color: theme.iconColor }}
        >
          <Icon icon={theme.Icon} size={24} aria-hidden />
        </div>
        <p className="text-sm font-medium text-white/90">{theme.label}</p>
      </div>

      {archived && (
        <span className="absolute left-3 top-3 rounded-xp-md bg-surface-inverse/90 px-2 py-0.5 text-xs font-medium text-text-inverse">
          Archived
        </span>
      )}

      {children}
    </div>
  )
}
