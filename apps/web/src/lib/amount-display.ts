import { cn } from './cn'
import { formatInr, TABULAR_AMOUNT_CLASS } from './format-inr'

export type AmountTone = 'neutral' | 'muted' | 'positive' | 'negative'

const toneClass: Record<AmountTone, string> = {
  neutral: 'text-text-primary',
  muted: 'text-text-secondary',
  positive: 'text-success-text',
  negative: 'text-error-text-strong',
}

export function parseAmount(amount: number | string): number | null {
  const value = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  return Number.isFinite(value) ? value : null
}

export function amountToneClass(tone: AmountTone, className?: string): string {
  return cn(TABULAR_AMOUNT_CLASS, 'font-semibold', toneClass[tone], className)
}

export function toneForSignedValue(value: number, zeroTone: AmountTone = 'muted'): AmountTone {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return zeroTone
}

export function formatSignedInr(
  amount: number | string,
  options?: { showPlus?: boolean },
): string {
  const value = parseAmount(amount)
  if (value == null) return formatInr(amount)
  if (value === 0) return formatInr(0)
  if (value < 0) return `−${formatInr(Math.abs(value))}`
  if (options?.showPlus) return `+${formatInr(value)}`
  return formatInr(value)
}
