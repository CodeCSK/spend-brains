import { formatInr } from '../../../lib/format-inr'
import type { AmountTone } from '../../../lib/amount-display'
import { parseAmount, toneForSignedValue } from '../../../lib/amount-display'

export type NetBalanceKind = 'even' | 'gets' | 'owes'

export type NetBalanceDisplay = {
  kind: NetBalanceKind
  value: number
  label: string
  amountText: string
  tone: AmountTone
}

export function parseNetBalance(netBalance: string): NetBalanceDisplay {
  const value = parseAmount(netBalance) ?? 0

  if (value === 0) {
    return {
      kind: 'even',
      value: 0,
      label: 'Even',
      amountText: formatInr(0),
      tone: 'muted',
    }
  }

  if (value > 0) {
    return {
      kind: 'gets',
      value,
      label: 'Gets',
      amountText: formatInr(value),
      tone: toneForSignedValue(value),
    }
  }

  return {
    kind: 'owes',
    value,
    label: 'Owes',
    amountText: formatInr(Math.abs(value)),
    tone: toneForSignedValue(value),
  }
}

/** @deprecated Prefer parseNetBalance for styled UI */
export function formatNetBalance(netBalance: string): string {
  const parsed = parseNetBalance(netBalance)
  if (parsed.kind === 'even') return 'Settled up'
  if (parsed.kind === 'gets') return `Gets back ${parsed.amountText}`
  return `Owes ${parsed.amountText}`
}
