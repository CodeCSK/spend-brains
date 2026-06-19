import type { LucideIcon } from 'lucide-react'

type IconProps = {
  icon: LucideIcon
  /** Default 20 — use 24 for nav / primary actions */
  size?: 16 | 20 | 24
  className?: string
  label?: string
}

const sizeClass = {
  16: 'h-4 w-4',
  20: 'h-5 w-5',
  24: 'h-6 w-6',
} as const

/**
 * Lucide wrapper — consistent size and a11y.
 * Decorative icons: omit label. Meaningful icons: pass label (aria-label).
 */
export function Icon({ icon: LucideComponent, size = 20, className, label }: IconProps) {
  return (
    <LucideComponent
      className={[sizeClass[size], 'shrink-0', className].filter(Boolean).join(' ')}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      strokeWidth={1.5}
    />
  )
}
