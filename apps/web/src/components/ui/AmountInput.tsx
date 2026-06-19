import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

import { INR_SYMBOL } from '../../lib/format-inr'
import { cn } from '../../lib/cn'
import { Input } from './Input'

export type AmountInputProps = InputHTMLAttributes<HTMLInputElement>

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(function AmountInput(
  { className, ...props },
  ref,
) {
  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-muted tabular-amount"
        aria-hidden
      >
        {INR_SYMBOL}
      </span>
      <Input
        ref={ref}
        inputMode="decimal"
        className={cn('pl-7 tabular-amount', className)}
        {...props}
      />
    </div>
  )
})
