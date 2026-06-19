import { cn } from '../../lib/cn'
import {
  amountToneClass,
  formatSignedInr,
  parseAmount,
  toneForSignedValue,
  type AmountTone,
} from '../../lib/amount-display'

type AmountProps = {
  value: number | string
  tone?: AmountTone
  /** Derive green/red from numeric sign when tone is omitted. */
  signed?: boolean
  showPlus?: boolean
  className?: string
}

export function Amount({ value, tone, signed = false, showPlus = false, className }: AmountProps) {
  const numeric = parseAmount(value)
  const resolvedTone =
    tone ?? (signed && numeric != null ? toneForSignedValue(numeric) : 'neutral')

  return (
    <span className={cn(amountToneClass(resolvedTone), className)}>
      {formatSignedInr(value, { showPlus: showPlus || signed })}
    </span>
  )
}
