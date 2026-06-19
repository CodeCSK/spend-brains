import type { ReactNode } from 'react'

type ProgressProps = {
  value: number
  /** Accessible name for the progress bar. */
  label?: string
  caption?: ReactNode
  className?: string
}

export function Progress({ value, label = 'Progress', caption, className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)))

  return (
    <div className={className}>
      <div className="h-2 overflow-hidden rounded-xp-full bg-surface-subtle">
        <div
          className="h-full rounded-xp-full bg-primary transition-[width]"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
      {caption != null && (
        <p className="mt-1 text-xs text-text-muted">{caption}</p>
      )}
    </div>
  )
}
