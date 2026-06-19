import { Badge } from '../../../components/ui'
import { Amount } from '../../../components/ui/Amount'
import { parseAmount } from '../../../lib/amount-display'
import type { SettlementSummary, SettlementStatus } from '../../../types/settlement'
import {
  settlementProgressPercent,
  SETTLEMENT_STATUS_LABELS,
} from '../lib/settlement-labels'
import { SettlementExportActions } from './SettlementExportButtons'

type SettlementSummaryCardProps = {
  eventId: string
  summary: SettlementSummary
}

function statusBadgeVariant(status: SettlementStatus): 'success' | 'warning' | 'info' {
  if (status === 'settled') return 'success'
  if (status === 'partial') return 'warning'
  return 'info'
}

function SettlementDonut({ percent }: { percent: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, percent))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div
      className="relative mx-auto h-[5.5rem] w-[5.5rem] shrink-0 sm:mx-0"
      aria-hidden
    >
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="var(--color-surface-subtle)"
          strokeWidth="7"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold tabular-amount text-text-primary">{clamped}%</span>
        <span className="text-[10px] text-text-muted">lines</span>
      </div>
    </div>
  )
}

type StatPillProps = {
  label: string
  value: string
  tone: 'neutral' | 'positive' | 'negative'
  className?: string
}

function StatPill({ label, value, tone, className }: StatPillProps) {
  return (
    <div className={className ?? 'xp-stat-pill'}>
      <p className="xp-amount-label">{label}</p>
      <Amount value={value} tone={tone} className="mt-0.5 block text-sm sm:text-base" />
    </div>
  )
}

function AmountProgressBar({
  settledAmount,
  outstandingAmount,
  totalSpent,
}: {
  settledAmount: string
  outstandingAmount: string
  totalSpent: string
}) {
  const total = parseAmount(totalSpent) ?? 0
  const settled = parseAmount(settledAmount) ?? 0
  const outstanding = parseAmount(outstandingAmount) ?? 0

  const settledPct = total > 0 ? Math.min(100, Math.round((settled / total) * 100)) : 0
  const outstandingPct = total > 0 ? Math.min(100 - settledPct, Math.round((outstanding / total) * 100)) : 0

  return (
    <div>
      <div
        className="flex h-2 overflow-hidden rounded-xp-full bg-surface-subtle"
        role="img"
        aria-label={`${settledPct}% of spend settled, ${outstandingPct}% outstanding`}
      >
        {settledPct > 0 && (
          <div className="bg-success-text transition-[width]" style={{ width: `${settledPct}%` }} />
        )}
        {outstandingPct > 0 && (
          <div
            className="bg-error-text-strong transition-[width]"
            style={{ width: `${outstandingPct}%` }}
          />
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-[10px] text-text-muted">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-xp-full bg-success-text" aria-hidden />
          Settled by amount
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-xp-full bg-error-text-strong" aria-hidden />
          Still owed
        </span>
      </div>
    </div>
  )
}

export function SettlementSummaryCard({ eventId, summary }: SettlementSummaryCardProps) {
  const lineProgress = settlementProgressPercent(summary.settledCount, summary.totalCount)

  return (
    <article className="xp-section-card" aria-labelledby="settlement-summary-heading">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="settlement-summary-heading" className="text-sm font-semibold text-text-label sm:text-base">
            Settlement overview
          </h2>
          <p className="mt-0.5 text-xs text-text-secondary">
            {summary.settledCount} of {summary.totalCount} payment line
            {summary.totalCount === 1 ? '' : 's'} marked settled
          </p>
        </div>
        <Badge variant={statusBadgeVariant(summary.status)} className="px-1.5 py-0 text-[10px]">
          {SETTLEMENT_STATUS_LABELS[summary.status]}
        </Badge>
      </div>

      <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <SettlementDonut percent={lineProgress} />

        <dl className="grid w-full flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
          <StatPill label="Total spent" value={summary.totalSpent} tone="neutral" />
          <StatPill label="Settled" value={summary.settledAmount} tone="positive" />
          <StatPill
            label="Outstanding"
            value={summary.outstandingAmount}
            tone="negative"
            className="xp-stat-pill col-span-2 sm:col-span-1"
          />
        </dl>
      </div>

      <div className="mt-4">
        <AmountProgressBar
          settledAmount={summary.settledAmount}
          outstandingAmount={summary.outstandingAmount}
          totalSpent={summary.totalSpent}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p id="settlement-export-label" className="text-xs text-text-muted">
          Download a shareable PDF or PNG snapshot
        </p>
        <SettlementExportActions eventId={eventId} />
      </div>
    </article>
  )
}
