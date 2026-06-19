import { formatInr } from '../../../lib/format-inr'

export function formatNetBalance(netBalance: string): string {
  const value = Number.parseFloat(netBalance)
  if (!Number.isFinite(value) || value === 0) {
    return 'Settled up'
  }
  if (value > 0) {
    return `Gets back ${formatInr(value)}`
  }
  return `Owes ${formatInr(Math.abs(value))}`
}
