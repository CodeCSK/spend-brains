import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'

import { cn } from '../../lib/cn'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  /** Compact size for inline list rows (role pickers, filters, etc.). */
  sizeVariant?: 'default' | 'compact'
  /** Layout width/constraints for the field wrapper (inline filters, table cells). */
  wrapperClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, wrapperClassName, sizeVariant = 'default', disabled, ...props },
  ref,
) {
  return (
    <div
      className={cn(
        'xp-select-wrap',
        sizeVariant === 'compact' && 'xp-select-wrap-compact',
        wrapperClassName,
      )}
    >
      <select
        ref={ref}
        disabled={disabled}
        className={cn(
          'xp-select',
          sizeVariant === 'compact' && 'xp-select-compact',
          className,
        )}
        {...props}
      />
      <ChevronDown
        className={cn(
          'xp-select-chevron',
          disabled && 'opacity-50',
        )}
        aria-hidden
        strokeWidth={1.75}
      />
    </div>
  )
})
