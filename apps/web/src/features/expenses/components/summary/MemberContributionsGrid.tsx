import { Avatar, Amount } from '../../../../components/ui'
import { cn } from '../../../../lib/cn'
import type { MemberBalance } from '../../../../types/settlement'
import { parseNetBalance } from '../../../settlements/lib/format-balance'
import { memberDisplayName } from '../../../settlements/lib/settlement-labels'

type MemberContributionsGridProps = {
  balances: MemberBalance[]
  currentUserId: string
}

export function MemberContributionsGrid({
  balances,
  currentUserId,
}: MemberContributionsGridProps) {
  if (balances.length === 0) return null

  const sorted = [...balances].sort((a, b) => {
    const aNet = parseNetBalance(a.netBalance).value
    const bNet = parseNetBalance(b.netBalance).value
    return bNet - aNet
  })

  return (
    <section aria-labelledby="member-contributions-heading" className="xp-summary-panel">
      <div className="xp-summary-panel-header">
        <h2 id="member-contributions-heading" className="xp-summary-panel-title">
          Member contributions
        </h2>
        <p className="xp-summary-panel-subtitle">Who paid and how balances net out.</p>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((balance) => {
          const net = parseNetBalance(balance.netBalance)
          const isCurrentUser = balance.userId === currentUserId

          return (
            <li key={balance.userId}>
              <article
                className={cn(
                  'xp-summary-member-card',
                  isCurrentUser && 'xp-summary-member-card-current',
                )}
                tabIndex={0}
              >
                <div className="flex items-start gap-3">
                  <Avatar src={balance.avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {memberDisplayName(balance.displayName)}
                      {isCurrentUser ? (
                        <span className="ml-1.5 text-xs font-medium text-text-muted">(You)</span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Paid <Amount value={balance.totalPaid} tone="muted" className="text-xs font-medium" />
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/70 pt-3">
                  <div>
                    <p className="xp-amount-label">Net balance</p>
                    {net.kind === 'even' ? (
                      <p className="mt-1 text-sm font-semibold text-text-muted">Settled up</p>
                    ) : (
                      <Amount
                        value={net.kind === 'owes' ? Math.abs(net.value) : net.value}
                        tone={net.tone}
                        signed={net.kind === 'gets'}
                        showPlus={net.kind === 'gets'}
                        className="mt-1 text-base"
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      'xp-summary-balance-pill',
                      net.kind === 'gets' && 'xp-summary-balance-pill-positive',
                      net.kind === 'owes' && 'xp-summary-balance-pill-negative',
                      net.kind === 'even' && 'xp-summary-balance-pill-neutral',
                    )}
                  >
                    {net.kind === 'gets' ? 'Gets back' : net.kind === 'owes' ? 'Owes' : 'Even'}
                  </span>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
