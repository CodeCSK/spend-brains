import { cn } from '../../lib/cn'

export type SegmentedOption<T extends string> = {
  value: T
  label: string
}

type SegmentedControlProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  'aria-label'?: string
  className?: string
  /** Stretch segments equally on small screens (events list filter). */
  stretch?: boolean
  size?: 'default' | 'compact'
}

const sizeClass = {
  default: 'px-3 py-2',
  compact: 'px-3 py-1.5',
} as const

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
  className,
  stretch = false,
  size = 'default',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn('flex rounded-xp-lg border border-border p-1', className)}
    >
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-xp-md text-sm font-medium transition-colors',
              sizeClass[size],
              stretch && 'flex-1 sm:flex-none',
              isActive
                ? 'bg-primary-surface text-primary'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
