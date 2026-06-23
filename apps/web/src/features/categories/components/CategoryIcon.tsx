import { cn } from '../../../lib/cn'
import { getCategoryLucideIcon } from '../lib/category-icons'

type CategoryIconProps = {
  iconKey: string
  size?: 16 | 20 | 24
  className?: string
  /** Tinted circular background — default for lists and legends */
  variant?: 'plain' | 'badge'
  /** Icon and badge tint (e.g. chart category color) */
  color?: string
}

const iconSizeClass = {
  16: 'h-4 w-4',
  20: 'h-5 w-5',
  24: 'h-6 w-6',
} as const

const badgeSizeClass = {
  16: 'h-8 w-8',
  20: 'h-9 w-9',
  24: 'h-10 w-10',
} as const

export function CategoryIcon({
  iconKey,
  size = 20,
  className,
  variant = 'plain',
  color,
}: CategoryIconProps) {
  const LucideComponent = getCategoryLucideIcon(iconKey)

  if (variant === 'badge') {
    return (
      <span
        className={cn(
          'xp-category-icon-badge inline-flex shrink-0 items-center justify-center rounded-xp-full',
          badgeSizeClass[size],
          !color && 'bg-surface-subtle text-primary',
          className,
        )}
        style={
          color
            ? {
                color,
                backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
              }
            : undefined
        }
        aria-hidden
      >
        <LucideComponent className={iconSizeClass[size]} strokeWidth={2.25} aria-hidden />
      </span>
    )
  }

  return (
    <LucideComponent
      className={cn(iconSizeClass[size], 'shrink-0', className)}
      strokeWidth={2.25}
      aria-hidden
    />
  )
}
