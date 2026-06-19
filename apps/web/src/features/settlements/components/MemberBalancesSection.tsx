import { Avatar, List, ListItem } from '../../../components/ui'
import type { MemberBalance } from '../../../types/settlement'
import { formatInr, TABULAR_AMOUNT_CLASS } from '../../../lib/format-inr'
import { formatNetBalance } from '../lib/format-balance'
import { memberDisplayName } from '../lib/settlement-labels'

type MemberBalancesSectionProps = {
  balances: MemberBalance[]
}

export function MemberBalancesSection({ balances }: MemberBalancesSectionProps) {
  if (balances.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="member-balances-heading">
      <h2 id="member-balances-heading" className="text-lg font-semibold text-text-label">
        Member balances
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Total paid vs fair share for each member. Payment lines above show who should pay whom.
      </p>

      <List className="mt-4 space-y-2">
        {balances.map((balance) => (
          <ListItem
            key={balance.userId}
            className="flex flex-col gap-3 rounded-xp-lg border border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar src={balance.avatarUrl} size="sm" />
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {memberDisplayName(balance.displayName)}
                </p>
                <p className="text-sm text-text-secondary">{formatNetBalance(balance.netBalance)}</p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:text-right">
              <div>
                <dt className="text-text-muted">Paid</dt>
                <dd className={`font-medium ${TABULAR_AMOUNT_CLASS}`}>
                  {formatInr(balance.totalPaid)}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">Share</dt>
                <dd className={`font-medium ${TABULAR_AMOUNT_CLASS}`}>
                  {formatInr(balance.totalShare)}
                </dd>
              </div>
            </dl>
          </ListItem>
        ))}
      </List>
    </section>
  )
}
