import { useQuery } from '@tanstack/react-query'
import { Scale } from 'lucide-react'
import { useMemo, useState } from 'react'

import { EmptyState } from '../../../components/layout'
import { Alert, SegmentedControl } from '../../../components/ui'
import { ApiError, getSettlements } from '../../../lib/api'
import { settlementKeys } from '../../../lib/query-keys'
import { useEventContext } from '../../events/context/EventContext'
import { MemberBalancesSection } from '../components/MemberBalancesSection'
import { SettlementExportButtons } from '../components/SettlementExportButtons'
import { SettlementLineRow } from '../components/SettlementLineRow'
import { SettlementSummaryCard } from '../components/SettlementSummaryCard'

type LineFilter = 'all' | 'unsettled'

export function EventSettlementsPage() {
  const { eventId, permissions } = useEventContext()
  const [lineFilter, setLineFilter] = useState<LineFilter>('all')

  const settlementsQuery = useQuery({
    queryKey: settlementKeys.summary(eventId),
    queryFn: () => getSettlements(eventId),
  })

  const filteredLines = useMemo(() => {
    const lines = settlementsQuery.data?.lines ?? []
    if (lineFilter === 'unsettled') {
      return lines.filter((line) => !line.isSettled)
    }
    return lines
  }, [lineFilter, settlementsQuery.data?.lines])

  if (settlementsQuery.isLoading) {
    return (
      <div className="space-y-4" aria-hidden>
        <div className="xp-skeleton-card min-h-48" />
        <div className="xp-skeleton-card min-h-32" />
      </div>
    )
  }

  if (settlementsQuery.isError) {
    return (
      <Alert variant="error">
        {settlementsQuery.error instanceof ApiError
          ? settlementsQuery.error.message
          : 'Failed to load settlements'}
      </Alert>
    )
  }

  const summary = settlementsQuery.data
  if (!summary) {
    return null
  }

  const hasLines = summary.lines.length > 0

  return (
    <div className="space-y-8">
      <SettlementSummaryCard summary={summary} />

      <section aria-labelledby="payment-lines-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="payment-lines-heading" className="text-lg font-semibold text-text-label">
              Payment lines
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Who should pay whom to settle up. Amounts come from logged expenses.
            </p>
          </div>

          <SegmentedControl
            aria-label="Settlement line filter"
            value={lineFilter}
            onChange={setLineFilter}
            size="compact"
            options={[
              { value: 'all', label: 'All' },
              { value: 'unsettled', label: 'Unsettled only' },
            ]}
          />
        </div>

        {!hasLines && (
          <div className="mt-6">
            <EmptyState
              icon={Scale}
              title="No settlements yet"
              description="Add expenses on the Expenses tab. Payment lines appear here once costs are split among members."
            />
          </div>
        )}

        {hasLines && filteredLines.length === 0 && lineFilter === 'unsettled' && (
          <Alert variant="success" live className="mt-6">
            All payment lines are settled.
          </Alert>
        )}

        {filteredLines.length > 0 && (
          <ul className="mt-4 space-y-3">
            {filteredLines.map((line) => (
              <SettlementLineRow
                key={line.id}
                eventId={eventId}
                line={line}
                canManage={permissions.canSettle}
              />
            ))}
          </ul>
        )}

        {!permissions.canSettle && hasLines && (
          <p className="mt-4 text-xs text-text-muted">
            Only the captain and vice captain can mark lines as settled.
          </p>
        )}
      </section>

      <MemberBalancesSection balances={summary.balances} />

      <SettlementExportButtons eventId={eventId} />
    </div>
  )
}
