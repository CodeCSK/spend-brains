import { Progress, Badge, Card } from '../../../components/ui'
import type { SettlementSummary, SettlementStatus } from '../../../types/settlement'
import { formatInr, TABULAR_AMOUNT_CLASS } from '../../../lib/format-inr'
import {
  settlementProgressPercent,
  SETTLEMENT_STATUS_LABELS,
} from '../lib/settlement-labels'

type SettlementSummaryCardProps = {
  summary: SettlementSummary
}

function statusBadgeVariant(status: SettlementStatus): 'success' | 'warning' | 'info' {
  if (status === 'settled') return 'success'
  if (status === 'partial') return 'warning'
  return 'info'
}

export function SettlementSummaryCard({ summary }: SettlementSummaryCardProps) {
  const progress = settlementProgressPercent(summary.settledCount, summary.totalCount)

  return (
    <Card as="article">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-label">Settlement progress</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {summary.settledCount} of {summary.totalCount} payment line
            {summary.totalCount === 1 ? '' : 's'} settled
          </p>
        </div>
        <Badge variant={statusBadgeVariant(summary.status)}>
          {SETTLEMENT_STATUS_LABELS[summary.status]}
        </Badge>
      </div>

      <Progress
        className="mt-4"
        value={progress}
        label="Settlement progress"
        caption={`${progress}% settled by line count`}
      />

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-text-muted">Total spent</dt>
          <dd className={`mt-1 text-lg font-semibold ${TABULAR_AMOUNT_CLASS}`}>
            {formatInr(summary.totalSpent)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Settled</dt>
          <dd className={`mt-1 text-lg font-semibold ${TABULAR_AMOUNT_CLASS}`}>
            {formatInr(summary.settledAmount)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Outstanding</dt>
          <dd className={`mt-1 text-lg font-semibold ${TABULAR_AMOUNT_CLASS}`}>
            {formatInr(summary.outstandingAmount)}
          </dd>
        </div>
      </dl>
    </Card>
  )
}
