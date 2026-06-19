import type { SettlementStatus } from '../../../types/settlement'

export const SETTLEMENT_STATUS_LABELS: Record<SettlementStatus, string> = {
  unsettled: 'Unsettled',
  partial: 'Partially settled',
  settled: 'All settled',
}

export function settlementStatusClass(status: SettlementStatus): string {
  if (status === 'settled') {
    return 'bg-success-bg text-success-text'
  }
  if (status === 'partial') {
    return 'bg-warning-bg text-warning-text'
  }
  return 'bg-info-bg text-info-text'
}

export function memberDisplayName(
  displayName: string | null,
  fallback = 'Member',
): string {
  return displayName?.trim() || fallback
}

export function settlementProgressPercent(settledCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0
  return Math.round((settledCount / totalCount) * 100)
}
