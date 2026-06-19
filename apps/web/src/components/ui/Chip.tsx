import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

type ChipProps = {
  children: ReactNode
  mono?: boolean
  className?: string
}

export function Chip({ children, mono = false, className }: ChipProps) {
  return (
    <span
      className={cn(
        'rounded-xp-md border border-border px-2 py-0.5 text-xs text-text-muted',
        mono && 'font-mono',
        className,
      )}
    >
      {children}
    </span>
  )
}
