import { Avatar } from '../../../components/ui'
import { Amount } from '../../../components/ui/Amount'
import { amountToneClass } from '../../../lib/amount-display'
import { cn } from '../../../lib/cn'
import type { MemberBalance } from '../../../types/settlement'
import { parseNetBalance } from '../lib/format-balance'
import { memberDisplayName } from '../lib/settlement-labels'

type MemberBalancesSectionProps = {
  balances: MemberBalance[]
}

const amountColClass = 'text-right md:min-w-[5.5rem] md:max-w-[7rem]'

function BalanceStat({
  label,
  value,
  tone,
  className,
}: {
  label: string
  value: string
  tone: 'neutral' | 'muted' | 'positive' | 'negative'
  className?: string
}) {
  if (label === 'Net') {
    const net = parseNetBalance(value)
    return (
      <div className={cn(amountColClass, className)}>
        <p className="xp-amount-label md:hidden">{net.label}</p>
        {net.kind === 'even' ? (
          <p className={cn(amountToneClass('muted', 'mt-0.5 text-xs sm:text-sm'))}>Even</p>
        ) : (
          <Amount
            value={net.kind === 'owes' ? Math.abs(net.value) : net.value}
            tone={net.tone}
            className="mt-0.5 block text-xs sm:text-sm"
          />
        )}
      </div>
    )
  }

  return (
    <div className={cn(amountColClass, className)}>
      <p className="xp-amount-label md:hidden">{label}</p>
      <Amount value={value} tone={tone} className="mt-0.5 block text-xs sm:text-sm" />
    </div>
  )
}

export function MemberBalancesSection({ balances }: MemberBalancesSectionProps) {
  if (balances.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="member-balances-heading" className="xp-section-card">
      <h2 id="member-balances-heading" className="text-sm font-semibold text-text-label sm:text-base">
        Member balances
      </h2>

      <div className="xp-compact-list mt-3 overflow-x-auto md:overflow-visible">
        <div
          className="hidden grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_6rem] items-center gap-3 border-b border-border bg-surface-subtle/50 px-3 py-2 text-right md:grid"
          aria-hidden
        >
          <span className="text-left text-[10px] font-medium uppercase tracking-wide text-text-muted">
            Member
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted">Paid</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted">Share</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted">Net</span>
        </div>

        <ul className="divide-y divide-border">
          {balances.map((balance) => (
            <li
              key={balance.userId}
              className="px-2 py-2 sm:px-3 sm:py-2.5 md:grid md:grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_6rem] md:items-center md:gap-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Avatar src={balance.avatarUrl} size="sm" />
                <p className="truncate text-sm font-medium">
                  {memberDisplayName(balance.displayName)}
                </p>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2 md:contents">
                <BalanceStat label="Paid" value={balance.totalPaid} tone="neutral" />
                <BalanceStat label="Share" value={balance.totalShare} tone="muted" />
                <BalanceStat label="Net" value={balance.netBalance} tone="neutral" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
