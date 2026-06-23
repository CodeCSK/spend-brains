import { useQuery } from '@tanstack/react-query'
import { Scale } from 'lucide-react'
import { useMemo, useState } from 'react'

import { EmptyState } from '../../../components/layout'
import { Alert, SegmentedControl } from '../../../components/ui'
import { ApiError, getSettlements } from '../../../lib/api'
import { settlementKeys } from '../../../lib/query-keys'
import { useEventContext } from '../../events/context/EventContext'
import { MemberBalancesSection } from '../components/MemberBalancesSection'
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
        <div className="xp-skeleton-card min-h-40" />
        <div className="xp-skeleton-card min-h-28" />
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
    <div className="space-y-4">
      <SettlementSummaryCard eventId={eventId} summary={summary} />

      <section aria-labelledby="payment-lines-heading" className="xp-section-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="payment-lines-heading" className="text-sm font-semibold text-text-label sm:text-base">
            Payment lines
          </h2>

          {hasLines && (
            <SegmentedControl
              aria-label="Settlement line filter"
              value={lineFilter}
              onChange={setLineFilter}
              size="compact"
              stretch
              className="w-full sm:w-auto"
              options={[
                { value: 'all', label: 'All' },
                { value: 'unsettled', label: 'Unsettled' },
              ]}
            />
          )}
        </div>

        {!hasLines && (
          <div className="mt-3">
            <EmptyState
              icon={Scale}
              title="No settlements yet"
            />
          </div>
        )}

        {hasLines && filteredLines.length === 0 && lineFilter === 'unsettled' && (
          <Alert variant="success" live className="mt-3">
            All payment lines are settled.
          </Alert>
        )}

        {filteredLines.length > 0 && (
          <ul className="xp-compact-list mt-3">
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
          <p className="mt-2 text-xs text-text-muted">
            Only captain and vice captain can mark lines settled.
          </p>
        )}
      </section>

      <MemberBalancesSection balances={summary.balances} />
    </div>
  )
}
