import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

import { cn } from '../../lib/cn'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn('accent-[var(--color-primary)]', className)}
      {...props}
    />
  )
})
